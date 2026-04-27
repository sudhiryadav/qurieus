import { footerData, sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import paddle, {
  EventName,
  normalizePaddleStatus,
  upsertUserSubscriptionFromPaddle,
} from "@/lib/paddle";
import { prisma } from "@/utils/prismaDB";
import { ensureSingleActiveSubscription } from "@/utils/subscription";
import { createHmac, timingSafeEqual } from "crypto";
import fs from "fs/promises";
import handlebars from "handlebars";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";
import puppeteer from "puppeteer";
import {
  extractTagFromCustomData,
  getNormalizedPaddleProductTag,
  isMatchingPaddleTag,
} from "@/lib/paddleProduct";
import { markWebhookIgnored, markWebhookProcessed } from "@/lib/paddleWebhookDebug";

// Register Handlebars helpers
handlebars.registerHelper("formatDate", (date: Date) =>
  date.toLocaleDateString(),
);
handlebars.registerHelper("formatAmount", (amount: string) =>
  (parseFloat(amount) / 100).toFixed(2),
);
handlebars.registerHelper("eq", (a: string, b: string) => a === b);

async function resolveSubscriptionFallback(data: any) {
  const subscriptionId = data?.subscription_id || data?.id;
  const customerId = data?.customer_id;

  if (!subscriptionId) {
    return { reason: "missing_subscription_id" as const, subscription: null };
  }

  const subscription = await prisma.userSubscription.findFirst({
    where: {
      OR: [
        { paddleSubscriptionId: subscriptionId },
        ...(customerId ? [{ paddleCustomerId: customerId }] : []),
      ],
    },
    include: {
      user: true,
    },
  });

  if (!subscription) {
    return { reason: "unmapped_practice" as const, subscription: null };
  }

  return { reason: null, subscription };
}

// Helper function to validate webhook security and get user
async function validateWebhookAndGetUser(customData: any, eventData?: any) {
  // Enhanced security validation
  const applicationCustomerId = customData?.application_customer_id;
  const applicationCustomerEmail = customData?.application_customer_email;
  const sessionId = customData?.session_id;
  const timestamp = customData?.timestamp;

  // Validate required fields
  if (!applicationCustomerId) {
    const fallback = await resolveSubscriptionFallback(eventData || {});
    if (fallback.subscription?.user) {
      return fallback.subscription.user;
    }
    logger.error("Missing application_customer_id in webhook");
    throw new Error("Invalid webhook data");
  }

  // Validate timestamp (prevent replay attacks - max 5 minutes old)
  // if (timestamp && (Date.now() - parseInt(timestamp)) > 5 * 60 * 1000) {
  //   console.error("Webhook timestamp too old, possible replay attack");
  //   throw new Error("Webhook expired");
  // }

  const user = await prisma.user.findFirst({
    where: {
      id: applicationCustomerId,
    },
  });

  if (!user) {
    logger.error("User not found for customer ID:", applicationCustomerId);
    throw new Error("User not found");
  }

  // Validate email matches (additional security)
  if (applicationCustomerEmail && applicationCustomerEmail !== user.email) {
    logger.error("Email mismatch in webhook:", {
      webhookEmail: applicationCustomerEmail,
      userEmail: user.email
    });
    throw new Error("Email validation failed");
  }

  return user;
}

// Helper function to create or update subscription using the better upsertUserSubscriptionFromPaddle method
async function upsertSubscription(paddleSubscriptionData: any, userId: string) {
  // If this is a new subscription being created, deactivate all other subscriptions first
  if (paddleSubscriptionData.status === "active") {
    await ensureSingleActiveSubscription(userId);
  }

  // Use the better upsertUserSubscriptionFromPaddle method
  return await upsertUserSubscriptionFromPaddle(paddleSubscriptionData, userId);
}

async function generateInvoicePDF({
  customerName,
  customerEmail,
  subscriptionId,
  planName,
  amount,
  currency,
  date,
  status,
}: {
  customerName: string;
  customerEmail: string;
  subscriptionId: string;
  planName: string;
  amount: string;
  currency: string;
  date: Date;
  status: string;
}) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();

  // Read and compile the template
  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "pdf",
    "invoice.hbs",
  );
  const templateContent = await fs.readFile(templatePath, "utf-8");
  const template = handlebars.compile(templateContent);

  // Generate HTML from template
  const html = template({
    customerName,
    customerEmail,
    subscriptionId,
    planName,
    amount,
    currency,
    date,
    status,
    logoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/images/logo/logo.svg`,
  });

  await page.setContent(html);
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
  });

  await browser.close();
  return pdf;
}

export async function POST(request: Request) {
  try {
    let event: any;
    
    // Check if webhook verification is bypassed for testing
    if (process.env.BYPASS_WEBHOOK_VERIFICATION === 'true') {
      logger.warn('⚠️ Webhook verification bypassed for testing');
      const bodyRaw = await request.text();
      event = JSON.parse(bodyRaw);
    } else {
      // Verify webhook signature using proper Paddle method
      const headersList = await headers();
      const paddleSignature = headersList.get('paddle-signature');
      const secretKey = process.env.PADDLE_WEBHOOK_SIGNING_KEY;

      // Check if header and secret key are present
      if (!paddleSignature) {
        logger.error("Paddle-Signature not present in request headers");
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
      }

      if (!secretKey) {
        logger.error("Secret key not defined");
        return NextResponse.json({ message: "Server misconfigured" }, { status: 500 });
      }

      const parts = paddleSignature.split(";");
      let timestamp: string | null = null;
      let signature: string | null = null;
      
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.startsWith("ts=")) {
          timestamp = trimmedPart.split("=")[1];
        } else if (trimmedPart.startsWith("h1=")) {
          signature = trimmedPart.split("=")[1];
        }
      }
      
      if (!timestamp || !signature) {
        logger.error("Unable to extract timestamp or signature from Paddle-Signature header");
        logger.error("Timestamp found:", timestamp);
        logger.error("Signature found:", signature);
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
      }

      // Check timestamp against current time and reject if it's over 5 seconds old
      const timestampInt = parseInt(timestamp) * 1000; // Convert seconds to milliseconds

      if (isNaN(timestampInt)) {
        logger.error("Invalid timestamp format");
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
      }

      // const currentTime = Date.now();

      // if (currentTime - timestampInt > 5000) {
      //   console.error("Webhook event expired (timestamp is over 5 seconds old):", timestampInt, currentTime);
      //   return NextResponse.json({ message: "Event expired" }, { status: 408 });
      // }

      // Build signed payload
      const bodyRaw = await request.text();
      const signedPayload = `${timestamp}:${bodyRaw}`;

      // Hash signed payload using HMAC SHA256 and the secret key
      const hashedPayload = createHmac("sha256", secretKey)
        .update(signedPayload, "utf8")
        .digest("hex");

      // Compare signatures
      if (!timingSafeEqual(Buffer.from(hashedPayload), Buffer.from(signature))) {
        logger.error("Computed signature does not match Paddle signature");
        logger.error("Computed:", hashedPayload);
        logger.error("Expected:", signature);
        
        const hmacBodyOnly = createHmac("sha256", secretKey)
          .update(bodyRaw, "utf8")
          .digest("hex");
        logger.info("- Body-only signature:", hmacBodyOnly);
        logger.info("- Body-only match:", hmacBodyOnly === signature);
        
        // Method 2: Try with different secret key format
        const altSecretKey = secretKey.startsWith('pdl_') ? secretKey.substring(4) : `pdl_${secretKey}`;
        const hmacAltKey = createHmac("sha256", altSecretKey)
          .update(signedPayload, "utf8")
          .digest("hex");
        logger.info("- Alt key signature:", hmacAltKey);
        logger.info("- Alt key match:", hmacAltKey === signature);
        
        // Try Paddle SDK unmarshal as final fallback
        logger.info("🔄 Trying Paddle SDK unmarshal method...");
        try {
          const event = paddle.webhooks.unmarshal(bodyRaw, paddleSignature, secretKey);
          logger.info("✅ Paddle SDK unmarshal verification successful");
          // Continue with the verified event
        } catch (unmarshalError) {
          logger.error("❌ Paddle SDK unmarshal also failed:", unmarshalError);
          logger.error("❌ All signature verification methods failed");
          return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }
      }
      event = JSON.parse(bodyRaw);
    }
    
    // Extract data from the webhook event (available in both bypass and verification paths)
    const { event_type: eventType, data } = event;
    const customData = data?.custom_data || {};
    const detectedTag = extractTagFromCustomData(customData);

    if (!isMatchingPaddleTag(customData)) {
      if (detectedTag) {
        logger.info("Ignoring Paddle webhook due to app tag mismatch", {
          eventType,
          detectedTag,
          expectedTag: getNormalizedPaddleProductTag(),
        });
        markWebhookIgnored(eventType, "app_tag_mismatch", detectedTag);
        return NextResponse.json({ ok: true, ignored: true, reason: "app_tag_mismatch" });
      }

      const fallback = await resolveSubscriptionFallback(data);
      if (fallback.reason === "missing_subscription_id") {
        logger.info("Ignoring Paddle webhook due to missing subscription mapping key", {
          eventType,
          detectedTag,
        });
        markWebhookIgnored(eventType, "missing_subscription_id", detectedTag);
        return NextResponse.json({ ok: true, ignored: true, reason: "missing_subscription_id" });
      }

      if (fallback.reason === "unmapped_practice") {
        logger.info("Ignoring Paddle webhook due to missing mapped practice/subscription", {
          eventType,
          detectedTag,
        });
        markWebhookIgnored(eventType, "unmapped_practice", detectedTag);
        return NextResponse.json({ ok: true, ignored: true, reason: "unmapped_practice" });
      }
    }

    markWebhookProcessed(eventType, detectedTag);

    // Handle all subscription status changes with a single, unified approach
    if (eventType === EventName.SubscriptionUpdated || 
        eventType === EventName.SubscriptionCreated || 
        eventType === EventName.SubscriptionActivated ||
        eventType === EventName.SubscriptionPaused ||
        eventType === EventName.SubscriptionResumed) {
      
      const {
        id: subscriptionId,
        status,
        items,
        next_billed_at: nextBilledAt,
        billing_cycle: billingCycle,
        currency_code: currencyCode,
        created_at: createdAt,
        customer_id: customerId,
        custom_data: customData,
      } = data;

      const plan = items[0]?.price?.name || items[0]?.price?.description || 'Unknown Plan';
      const amount = items[0]?.price?.unit_price?.amount;

      let user;
      try {
        user = await validateWebhookAndGetUser(customData, data);
      } catch (error) {
        if (error instanceof Error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        throw error;
      }

      try {
        // Use the helper function to create or update subscription
        await upsertSubscription(data, user.id);
      } catch (error) {
        if (error instanceof Error && error.message.includes("Plan not found")) {
          logger.error("Plan not found error:", error.message);
          // Log the data for debugging
          logger.error("Subscription data:", {
            subscriptionId: data.id,
            priceId: data.items?.[0]?.price?.id,
            priceName: data.items?.[0]?.price?.name,
            plan: data.items?.[0]?.price?.name
          });
          return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }
        throw error;
      }

              // Send email only for new subscriptions
        if (eventType === EventName.SubscriptionCreated) {
          try {
            const invoicePDF = await generateInvoicePDF({
              customerName: user.name || "Customer",
              customerEmail: user.email,
              subscriptionId,
              planName: plan,
              amount: amount || '0',
              currency: currencyCode,
              date: createdAt ? new Date(createdAt) : new Date(),
              status,
            });

            await sendEmail({
              to: user.email,
              subject: "Welcome to Qurieus - Your Subscription Details",
              template: "subscription-confirmation",
              context: {
                customerName: user.name || "Customer",
                plan,
                amount: amount/100,
                currency: currencyCode,
                billingCycle: billingCycle.interval,
                nextBillingDate: nextBilledAt ? new Date(nextBilledAt).toLocaleDateString() : 'N/A', 
                subscriptionId: subscriptionId,
                ...footerData
              },
              attachments: [
                {
                  filename: `invoice-${subscriptionId}.pdf`,
                  content: invoicePDF,
                  contentType: "application/pdf",
                },
              ],
            });

            await sendEmail({
              to: process.env.ADMIN_EMAIL || "hello@qurieus.com",
              subject: "New Subscription Created",
              template: "admin-subscription-notification",
              context: {
                customerName: user.name || "Customer",
                customerEmail: user.email,
                planName: plan,
                amount,
                currency: currencyCode,
                billingCycle: billingCycle.interval,
                nextBillingDate: nextBilledAt ? new Date(nextBilledAt).toLocaleDateString() : 'N/A',
                ...footerData
              },
            });
          } catch (emailError) {
            logger.error("Error sending subscription confirmation email:", emailError);
          }
        }
    }



      //#region Subscription Cancelled
      if (eventType === EventName.SubscriptionCanceled) {
        const { id: subscriptionId, status, custom_data: customData } = data;

        let user;
        try {
          user = await validateWebhookAndGetUser(customData, data);
        } catch (error) {
          if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }
          throw error;
        }

        // Update the subscription status
        await prisma.userSubscription.update({
          where: {
            paddleSubscriptionId: subscriptionId,
          },
          data: {
            status: normalizePaddleStatus(status),
          },
        });

        try {
          await sendEmail({
            to: user.email,
            subject: "Your Qurieus Subscription Has Been Cancelled",
            template: "subscription-cancelled",
            context: {
              customerName: user.name || "Customer",
              ...footerData
            },
          });
        } catch (emailError) {
          logger.error("Error sending subscription cancellation email:", emailError);
        }
      }


      //#region Transaction Completed
      if (eventType === EventName.TransactionCreated) {
        const {
          id: transactionId,
          items,
          currency_code: currencyCode,
          custom_data: customData,
          subscription_id: subscriptionId, // This is the subscription ID if transaction is for a subscription
        } = data;

        let user;
        const transactionCustomData = customData || data?.custom_data || {};
        try {
          user = await validateWebhookAndGetUser(transactionCustomData, data);
        } catch (error: any) {
          logger.error("Transaction webhook validation failed:", error.message);
          // For transaction events, try to get user from subscription if available
          if (subscriptionId) {
            const existingSubscription = await prisma.userSubscription.findFirst({
              where: { paddleSubscriptionId: subscriptionId },
              include: { user: true }
            });
            if (existingSubscription) {
              user = existingSubscription.user;
              logger.info("Found user from existing subscription:", user.id);
            } else {
              return NextResponse.json({ error: error.message }, { status: 400 });
            }
          } else {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }
        }

        // If this transaction is for an existing subscription, just update payment info
        if (subscriptionId) {
          logger.info("Transaction for existing subscription, updating payment info only");
          
          // Find the existing subscription
          const existingSubscription = await prisma.userSubscription.findFirst({
            where: {
              paddleSubscriptionId: subscriptionId,
            },
          });

          if (existingSubscription) {
            // Update payment information only
            await prisma.userSubscription.update({
              where: {
                paddleSubscriptionId: subscriptionId,
              },
              data: {
                paddlePaymentId: transactionId,
                paddlePaymentDate: new Date(),
                paddlePaymentAmount: items[0]?.price?.unit_price?.amount ? parseFloat(items[0]?.price?.unit_price?.amount) : 0,
                paddlePaymentCurrency: currencyCode,
              },
            });

            // Send payment confirmation email
            try {
              await sendEmail({
                to: user.email,
                subject: "Payment Received - Qurieus",
                template: "payment-received",
                context: {
                  customerName: user.name || "Customer",
                  planName: "Subscription Payment",
                  amount: items[0]?.price?.unit_price?.amount/100,
                  currency: currencyCode,
                  transactionId,
                  ...footerData
                },
              });
            } catch (emailError) {
              logger.error("Error sending payment confirmation email:", emailError);
            }
          } else {
            logger.warn("Transaction for subscription but subscription not found:", subscriptionId);
          }
        } else {
          // This is a one-time transaction (not for a subscription)
          // For standalone transactions, we should NOT create a subscription
          // Subscriptions should only be created via subscription webhooks
          logger.info("Standalone transaction - no subscription to create");
          
          // Just send payment confirmation email
          const amount = items[0]?.price?.unit_price?.amount;
          const plan = items[0]?.price?.name;

          try {
            await sendEmail({
              to: user.email,
              subject: "Payment Received - Qurieus",
              template: "payment-received",
              context: {
                customerName: user.name || "Customer",
                planName: plan || "One-time Payment",
                amount: amount/100,
                currency: currencyCode,
                transactionId,
                ...footerData
              },
            });
          } catch (emailError) {
            logger.error("Error sending payment confirmation email:", emailError);
          }
        }
      }



      return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

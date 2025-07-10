import { footerData, sendEmail } from "@/lib/email";
import paddle,{ EventName } from "@/lib/paddle";
import { prisma } from "@/utils/prismaDB";
import fs from "fs/promises";
import handlebars from "handlebars";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";
import puppeteer from "puppeteer";
import { createHmac, timingSafeEqual } from "crypto";

// Register Handlebars helpers
handlebars.registerHelper("formatDate", (date: Date) =>
  date.toLocaleDateString(),
);
handlebars.registerHelper("formatAmount", (amount: string) =>
  (parseFloat(amount) / 100).toFixed(2),
);
handlebars.registerHelper("eq", (a: string, b: string) => a === b);

// Helper function to validate webhook security and get user
async function validateWebhookAndGetUser(customData: any) {
  // Enhanced security validation
  const applicationCustomerId = customData?.application_customer_id;
  const applicationCustomerEmail = customData?.application_customer_email;
  const sessionId = customData?.session_id;
  const timestamp = customData?.timestamp;

  console.log("Security validation:", {
    applicationCustomerId,
    applicationCustomerEmail,
    sessionId,
    timestamp,
    currentTime: Date.now(),
    timestampAge: timestamp ? Date.now() - parseInt(timestamp) : 'N/A'
  });

  // Validate required fields
  if (!applicationCustomerId) {
    console.error("Missing application_customer_id in webhook");
    throw new Error("Invalid webhook data");
  }

  // Validate timestamp (prevent replay attacks - max 5 minutes old)
  if (timestamp && (Date.now() - parseInt(timestamp)) > 5 * 60 * 1000) {
    console.error("Webhook timestamp too old, possible replay attack");
    throw new Error("Webhook expired");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: applicationCustomerId,
    },
  });

  if (!user) {
    console.error("User not found for customer ID:", applicationCustomerId);
    throw new Error("User not found");
  }

  // Validate email matches (additional security)
  if (applicationCustomerEmail && applicationCustomerEmail !== user.email) {
    console.error("Email mismatch in webhook:", {
      webhookEmail: applicationCustomerEmail,
      userEmail: user.email
    });
    throw new Error("Email validation failed");
  }

  return user;
}

// Helper function to create or update subscription
async function upsertSubscription({
  subscriptionId,
  customerId,
  status,
  plan,
  amount,
  currencyCode,
  nextBilledAt,
  billingCycle,
  createdAt,
  userId,
}: {
  subscriptionId: string;
  customerId: string;
  status: string;
  plan: string;
  amount: string | number;
  currencyCode: string;
  nextBilledAt?: string;
  billingCycle?: { interval: string };
  createdAt?: string;
  userId: string;
}) {
  // Find the plan in our database
  const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
    where: {
      name: plan,
    },
  });

  if (!subscriptionPlan) {
    throw new Error("Plan not found");
  }

  // Upsert subscription - handles both create and update
  return await prisma.userSubscription.upsert({
    where: {
      paddleSubscriptionId: subscriptionId,
    },
    create: {
      paddleSubscriptionId: subscriptionId,
      paddleCustomerId: customerId,
      status,
      paddlePaymentAmount: amount ? parseFloat(amount.toString()) : 0,
      paddlePaymentCurrency: currencyCode,
      nextBillingDate: nextBilledAt ? new Date(nextBilledAt) : new Date(),
      billingCycle: billingCycle?.interval || "monthly",
      startDate: createdAt ? new Date(createdAt) : new Date(),
      currentPeriodStart: createdAt ? new Date(createdAt) : new Date(),
      currentPeriodEnd: nextBilledAt ? new Date(nextBilledAt) : new Date(),
      userId,
      planId: subscriptionPlan.id,
    },
    update: {
      status,
      paddlePaymentAmount: amount ? parseFloat(amount.toString()) : 0,
      paddlePaymentCurrency: currencyCode,
      nextBillingDate: nextBilledAt ? new Date(nextBilledAt) : new Date(),
      billingCycle: billingCycle?.interval || "monthly",
      currentPeriodStart: createdAt ? new Date(createdAt) : new Date(),
      currentPeriodEnd: nextBilledAt ? new Date(nextBilledAt) : new Date(),
      planId: subscriptionPlan.id,
    },
  });
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
      console.log('⚠️ Webhook verification bypassed for testing');
      const bodyRaw = await request.text();
      event = JSON.parse(bodyRaw);
      console.log("Webhook event received:", event.event_type);
      console.log("Event data:", JSON.stringify(event, null, 2));
    } else {
      // Verify webhook signature using proper Paddle method
      const headersList = await headers();
      const paddleSignature = headersList.get('paddle-signature');
      const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY;

      // Check if header and secret key are present
      if (!paddleSignature) {
        console.error("Paddle-Signature not present in request headers");
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
      }

      if (!secretKey) {
        console.error("Secret key not defined");
        return NextResponse.json({ message: "Server misconfigured" }, { status: 500 });
      }

      // Extract timestamp and signature from header
      console.log("🔍 Raw Paddle-Signature header:", paddleSignature);
      
      // Parse the signature header - it can have multiple parts
      const parts = paddleSignature.split(";");
      console.log("🔍 Signature header parts:", parts);
      
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
        console.error("Unable to extract timestamp or signature from Paddle-Signature header");
        console.error("Timestamp found:", timestamp);
        console.error("Signature found:", signature);
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
      }

      // Check timestamp against current time and reject if it's over 5 seconds old
      const timestampInt = parseInt(timestamp) * 1000; // Convert seconds to milliseconds

      if (isNaN(timestampInt)) {
        console.error("Invalid timestamp format");
        return NextResponse.json({ message: "Invalid request" }, { status: 400 });
      }

      const currentTime = Date.now();

      if (currentTime - timestampInt > 5000) {
        console.error("Webhook event expired (timestamp is over 5 seconds old):", timestampInt, currentTime);
        return NextResponse.json({ message: "Event expired" }, { status: 408 });
      }

      // Build signed payload
      const bodyRaw = await request.text();
      const signedPayload = `${timestamp}:${bodyRaw}`;

      // Debug logging for signature verification
      console.log("🔍 Signature verification debug:");
      console.log("- Secret key length:", secretKey.length);
      console.log("- Secret key prefix:", secretKey.substring(0, 4));
      console.log("- Timestamp:", timestamp);
      console.log("- Body length:", bodyRaw.length);
      console.log("- Signed payload length:", signedPayload.length);
      console.log("- Signed payload (first 100 chars):", signedPayload.substring(0, 100));
      
      // Hash signed payload using HMAC SHA256 and the secret key
      const hashedPayload = createHmac("sha256", secretKey)
        .update(signedPayload, "utf8")
        .digest("hex");

      console.log("- Computed signature:", hashedPayload);
      console.log("- Expected signature:", signature);
      console.log("- Signatures match:", hashedPayload === signature);

      // Compare signatures
      if (!timingSafeEqual(Buffer.from(hashedPayload), Buffer.from(signature))) {
        console.error("Computed signature does not match Paddle signature");
        console.error("Computed:", hashedPayload);
        console.error("Expected:", signature);
        
        // Try alternative verification methods for debugging
        console.log("🔄 Trying alternative verification methods...");
        
        // Method 1: Try without timestamp
        const hmacBodyOnly = createHmac("sha256", secretKey)
          .update(bodyRaw, "utf8")
          .digest("hex");
        console.log("- Body-only signature:", hmacBodyOnly);
        console.log("- Body-only match:", hmacBodyOnly === signature);
        
        // Method 2: Try with different secret key format
        const altSecretKey = secretKey.startsWith('pdl_') ? secretKey.substring(4) : `pdl_${secretKey}`;
        const hmacAltKey = createHmac("sha256", altSecretKey)
          .update(signedPayload, "utf8")
          .digest("hex");
        console.log("- Alt key signature:", hmacAltKey);
        console.log("- Alt key match:", hmacAltKey === signature);
        
        // Try Paddle SDK unmarshal as final fallback
        console.log("🔄 Trying Paddle SDK unmarshal method...");
        try {
          const event = paddle.webhooks.unmarshal(bodyRaw, paddleSignature, secretKey);
          console.log("✅ Paddle SDK unmarshal verification successful");
          // Continue with the verified event
        } catch (unmarshalError) {
          console.error("❌ Paddle SDK unmarshal also failed:", unmarshalError);
          console.error("❌ All signature verification methods failed");
          return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }
      }

      console.log("✅ Webhook signature verified successfully");
      
      // Parse the webhook event
      event = JSON.parse(bodyRaw);
      console.log("Webhook event received:", event.event_type);
      console.log("Event data:", JSON.stringify(event, null, 2));
    }
    
    // Extract data from the webhook event (available in both bypass and verification paths)
    const { event_type: eventType, data } = event;

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

      const plan = items[0]?.product?.name || items[0]?.product?.description || 'Unknown Plan';
      const amount = items[0]?.price?.unit_price?.amount;

      let user;
      try {
        user = await validateWebhookAndGetUser(customData);
      } catch (error) {
        if (error instanceof Error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        throw error;
      }

      try {
        // Use the helper function to create or update subscription
        await upsertSubscription({
          subscriptionId,
          customerId,
          status,
          plan,
          amount,
          currencyCode,
          nextBilledAt,
          billingCycle,
          createdAt,
          userId: user.id,
        });
      } catch (error) {
        if (error instanceof Error && error.message === "Plan not found") {
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
                planName: plan,
                amount,
                currency: currencyCode,
                billingCycle: billingCycle.interval,
                nextBillingDate: nextBilledAt ? new Date(nextBilledAt).toLocaleDateString() : 'N/A',
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
              to: process.env.ADMIN_EMAIL || "admin@qurieus.com",
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
            console.error("Error sending subscription confirmation email:", emailError);
          }
        }
    }



      //#region Subscription Cancelled
      if (eventType === EventName.SubscriptionCanceled) {
        const { id: subscriptionId, status, custom_data: customData } = data;

        let user;
        try {
          user = await validateWebhookAndGetUser(customData);
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
            status,
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
          console.error("Error sending subscription cancellation email:", emailError);
        }
      }


      //#region Transaction Completed
      if (eventType === EventName.TransactionCreated) {
        const {
          id: transactionId,
          status,
          items,
          currency_code: currencyCode,
          custom_data: customData,
          subscription_id: subscriptionId, // This is the subscription ID if transaction is for a subscription
        } = data;

        console.log("Transaction created event:", {
          transactionId,
          subscriptionId,
          hasSubscriptionId: !!subscriptionId,
          items: items?.length,
          customData: customData || 'none'
        });

        let user;
        const transactionCustomData = customData || data?.custom_data || {};
        try {
          user = await validateWebhookAndGetUser(transactionCustomData);
        } catch (error: any) {
          console.error("Transaction webhook validation failed:", error.message);
          // For transaction events, try to get user from subscription if available
          if (subscriptionId) {
            const existingSubscription = await prisma.userSubscription.findFirst({
              where: { paddleSubscriptionId: subscriptionId },
              include: { user: true }
            });
            if (existingSubscription) {
              user = existingSubscription.user;
              console.log("Found user from existing subscription:", user.id);
            } else {
              return NextResponse.json({ error: error.message }, { status: 400 });
            }
          } else {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }
        }

        // If this transaction is for an existing subscription, just update payment info
        if (subscriptionId) {
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
                amount: items[0]?.price?.unit_price?.amount,
                currency: currencyCode,
                transactionId,
                ...footerData
              },
            });
          } catch (emailError) {
            console.error("Error sending payment confirmation email:", emailError);
          }
        } else {
          // This is a one-time transaction (not for a subscription)
          // Handle as before for transaction-based subscriptions
          const amount = items[0]?.price?.unit_price?.amount;
          const plan = items[0]?.price?.name;

          try {
            await upsertSubscription({
              subscriptionId: transactionId,
              customerId: user.id,
              status: "active",
              plan,
              amount,
              currencyCode,
              nextBilledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              billingCycle: { interval: "monthly" },
              createdAt: new Date().toISOString(),
              userId: user.id,
            });

            // Update additional transaction-specific fields
            await prisma.userSubscription.update({
              where: {
                paddleSubscriptionId: transactionId,
              },
              data: {
                paddlePaymentId: transactionId,
                paddlePaymentDate: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            });

            await sendEmail({
              to: user.email,
              subject: "Payment Received - Qurieus",
              template: "payment-received",
              context: {
                customerName: user.name || "Customer",
                planName: plan,
                amount,
                currency: currencyCode,
                transactionId,
                ...footerData
              },
            });
          } catch (error) {
            if (error instanceof Error && error.message === "Plan not found") {
              return NextResponse.json({ error: "Plan not found" }, { status: 404 });
            }
            throw error;
          }
        }
      }



      return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

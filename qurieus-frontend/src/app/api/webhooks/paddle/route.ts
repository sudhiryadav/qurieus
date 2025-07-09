import { footerData, sendEmail } from "@/lib/email";
import { EventName } from "@/lib/paddle";
import { prisma } from "@/utils/prismaDB";
import fs from "fs/promises";
import handlebars from "handlebars";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";
import puppeteer from "puppeteer";
import { Paddle } from '@paddle/paddle-node-sdk';
import { createHmac, timingSafeEqual } from "crypto";

// Register Handlebars helpers
handlebars.registerHelper("formatDate", (date: Date) =>
  date.toLocaleDateString(),
);
handlebars.registerHelper("formatAmount", (amount: string) =>
  (parseFloat(amount) / 100).toFixed(2),
);
handlebars.registerHelper("eq", (a: string, b: string) => a === b);

// Initialize Paddle SDK
const paddle = new Paddle(process.env.PADDLE_API_KEY || '');

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

      if (eventType === EventName.SubscriptionCreated) {
        const {
          id: subscriptionId,
          status,
          items,
          nextBilledAt,
          billingCycle,
          currencyCode,
          createdAt,
          customerId,
          customData,
        } = data;

        const plan = items[0]?.product?.name || items[0]?.product?.description || 'Unknown Plan';
        const amount = items[0]?.price?.unitPrice?.amount;

        const user = await prisma.user.findFirst({
          where: {
            id: (customData as any)?.application_customer_id,
          },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // First find the plan in our database
        const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
          where: {
            name: plan,
          },
        });

        if (!subscriptionPlan) {
          return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        // if the subscription already exists, update it
        await prisma.userSubscription.upsert({
          where: {
            paddleSubscriptionId: subscriptionId,
          },
          create: {
            paddleSubscriptionId: subscriptionId,
            paddleCustomerId: customerId,
            status,
            paddlePaymentAmount: amount ? parseFloat(amount) : 0,
            paddlePaymentCurrency: currencyCode,
            nextBillingDate: nextBilledAt ? new Date(nextBilledAt) : new Date(),
            billingCycle: billingCycle.interval,
            startDate: createdAt ? new Date(createdAt) : new Date(),
            currentPeriodStart: createdAt ? new Date(createdAt) : new Date(),
            currentPeriodEnd: nextBilledAt ? new Date(nextBilledAt) : new Date(),
            userId: user.id,
            planId: subscriptionPlan.id,
          },
          update: {
            status,
            paddlePaymentAmount: amount ? parseFloat(amount) : 0,
            paddlePaymentCurrency: currencyCode,
            nextBillingDate: nextBilledAt ? new Date(nextBilledAt) : new Date(),
            billingCycle: billingCycle.interval,
            currentPeriodStart: createdAt ? new Date(createdAt) : new Date(),
            currentPeriodEnd: nextBilledAt ? new Date(nextBilledAt) : new Date(),
            planId: subscriptionPlan.id,
          },
        });

        try {
          const invoicePDF = await generateInvoicePDF({
            customerName: user.name || "Customer",
            customerEmail: user.email,
            subscriptionId,
            planName: subscriptionPlan.name,
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
              planName: subscriptionPlan.name,
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
              planName: subscriptionPlan.name,
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

      //#region Subscription Updated
      if (eventType === EventName.SubscriptionUpdated) {
        const {
          id: subscriptionId,
          status,
          items,
          nextBilledAt,
          billingCycle,
          currencyCode,
          customData,
        } = data;

        const plan = items[0]?.product?.name || items[0]?.product?.description || 'Unknown Plan';
        const amount = items[0]?.price?.unitPrice?.amount;

        const user = await prisma.user.findFirst({
          where: {
            id: (customData as any)?.application_customer_id,
          },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // First find the plan in our database
        const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
          where: {
            name: plan,
          },
        });

        if (!subscriptionPlan) {
          return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        // Update the subscription
        await prisma.userSubscription.update({
          where: {
            paddleSubscriptionId: subscriptionId,
          },
          data: {
            status,
            paddlePaymentAmount: amount ? parseFloat(amount) : 0,
            paddlePaymentCurrency: currencyCode,
            nextBillingDate: nextBilledAt ? new Date(nextBilledAt) : new Date(),
            billingCycle: billingCycle.interval,
            planId: subscriptionPlan.id,
          },
        });

        try {
          await sendEmail({
            to: user.email,
            subject: "Your Qurieus Subscription Has Been Updated",
            template: "subscription-updated",
            context: {
              customerName: user.name || "Customer",
              planName: subscriptionPlan.name,
              amount,
              currency: currencyCode,
              billingCycle: billingCycle.interval,
              nextBillingDate: nextBilledAt ? new Date(nextBilledAt).toLocaleDateString() : 'N/A',
              ...footerData
            },
          });
        } catch (emailError) {
          console.error("Error sending subscription update email:", emailError);
        }
      }

      //#region Subscription Cancelled
      if (eventType === EventName.SubscriptionCanceled) {
        const { id: subscriptionId, status, customData } = data;

        const user = await prisma.user.findFirst({
          where: {
            id: (customData as any)?.application_customer_id,
          },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
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

      //#region Subscription Activated
      if (eventType === EventName.SubscriptionActivated) {
        const {
          id: subscriptionId,
          status,
          items,
          nextBilledAt,
          billingCycle,
          currencyCode,
          customData,
        } = data;

        const plan = items[0]?.product?.name || items[0]?.product?.description || 'Unknown Plan';
        const amount = items[0]?.price?.unitPrice?.amount;

        const user = await prisma.user.findFirst({
          where: {
            id: (customData as any)?.application_customer_id,
          },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // First find the plan in our database
        const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
          where: {
            name: plan,
          },
        });

        if (!subscriptionPlan) {
          return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        // Update the subscription
        await prisma.userSubscription.update({
          where: {
            paddleSubscriptionId: subscriptionId,
          },
          data: {
            status,
            paddlePaymentAmount: amount ? parseFloat(amount) : 0,
            paddlePaymentCurrency: currencyCode,
            nextBillingDate: nextBilledAt ? new Date(nextBilledAt) : new Date(),
            billingCycle: billingCycle.interval,
            planId: subscriptionPlan.id,
          },
        });

        try {
          await sendEmail({
            to: user.email,
            subject: "Your Qurieus Subscription Has Been Activated",
            template: "subscription-activated",
            context: {
              customerName: user.name || "Customer",
              planName: subscriptionPlan.name,
              amount,
              currency: currencyCode,
              billingCycle: billingCycle.interval,
              nextBillingDate: nextBilledAt ? new Date(nextBilledAt).toLocaleDateString() : 'N/A',
              ...footerData
            },
          });
        } catch (emailError) {
          console.error("Error sending subscription activation email:", emailError);
        }
      }

      //#region Transaction Completed
      if (eventType === EventName.TransactionCompleted) {
        const {
          id: transactionId,
          status,
          items,
          currencyCode,
          customData,
        } = data;

        // For transaction items, we need to access the product differently
        const amount = items[0]?.price?.unitPrice?.amount;
        const plan = 'Transaction Completed'; // Transaction items don't have direct product info

        const user = await prisma.user.findFirst({
          where: {
            id: (customData as any)?.application_customer_id,
          },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        try {
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
        } catch (emailError) {
          console.error("Error sending payment confirmation email:", emailError);
        }
      }

      //#region Subscription Paused
      if (eventType === EventName.SubscriptionPaused) {
        const { id: subscriptionId, status, customData } = data;

        const user = await prisma.user.findFirst({
          where: {
            id: (customData as any)?.application_customer_id,
          },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
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
            subject: "Your Qurieus Subscription Has Been Paused",
            template: "subscription-paused",
            context: {
              customerName: user.name || "Customer",
              ...footerData
            },
          });
        } catch (emailError) {
          console.error("Error sending subscription pause email:", emailError);
        }
      }

      //#region Subscription Unpaused
      if (eventType === EventName.SubscriptionResumed) {
        const { id: subscriptionId, status, customData } = data;

        const user = await prisma.user.findFirst({
          where: {
            id: (customData as any)?.application_customer_id,
          },
        });

        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
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
            subject: "Your Qurieus Subscription Has Been Resumed",
            template: "subscription-resumed",
            context: {
              customerName: user.name || "Customer",
              ...footerData
            },
          });
        } catch (emailError) {
          console.error("Error sending subscription resume email:", emailError);
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

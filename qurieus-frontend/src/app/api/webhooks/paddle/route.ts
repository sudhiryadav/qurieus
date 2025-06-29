import { footerData, sendEmail } from "@/lib/email";
import { prisma } from "@/utils/prismaDB";
import { verifyPaddleWebhook } from "@/lib/paddle";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";

// Register Handlebars helpers
handlebars.registerHelper("formatDate", (date: Date) =>
  date.toLocaleDateString(),
);
handlebars.registerHelper("formatAmount", (amount: string) =>
  (parseFloat(amount) / 100).toFixed(2),
);
handlebars.registerHelper("eq", (a: string, b: string) => a === b);

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

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const paddleSignature = headersList.get("paddle-signature");

    if (!paddleSignature) {
      return NextResponse.json(
        { error: "No Paddle signature found" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { event_type, data } = body;

    // TOOD : Verify the webhook signature later when we have webhook signing key
    // const isValid = verifyPaddleWebhook(
    //   body,
    //   paddleSignature,
    //   process.env.PADDLE_WEBHOOK_SIGNING_KEY || ""
    // );

    // if (!isValid) {
    //   return NextResponse.json(
    //     { error: "Invalid webhook signature" },
    //     { status: 401 },
    //   );
    // }

    if (event_type === "subscription.created") {
      const {
        id: subscriptionId,
        status,
        items,
        next_billed_at,
        billing_cycle,
        currency,
        created_at,
        customer_id: customerId,
        custom_data,
      } = data;

      const plan = items[0].product.name || items[0].product.description;
      const amount = items[0].price.unit_price.amount;

      const user = await prisma.user.findFirst({
        where: {
          id: custom_data.application_customer_id,
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
          paddlePaymentCurrency: currency,
          nextBillingDate: new Date(next_billed_at),
          billingCycle: billing_cycle.interval,
          startDate: new Date(created_at),
          currentPeriodStart: new Date(created_at),
          currentPeriodEnd: new Date(next_billed_at),
          userId: user.id,
          planId: subscriptionPlan.id,
        },
        update: {
          status,
          paddlePaymentAmount: amount ? parseFloat(amount) : 0,
          paddlePaymentCurrency: currency,
          nextBillingDate: new Date(next_billed_at),
          billingCycle: billing_cycle.interval,
          currentPeriodStart: new Date(created_at),
          currentPeriodEnd: new Date(next_billed_at),
          planId: subscriptionPlan.id,
        },
      });

      try {
        const invoicePDF = await generateInvoicePDF({
          customerName: user.name || "Customer",
          customerEmail: user.email,
          subscriptionId,
          planName: subscriptionPlan.name,
          amount,
          currency,
          date: new Date(created_at),
          status,
        });

        await sendEmail({
          to: user.email,
          subject: "Welcome to Qurieus - Your Subscription Details",
          template: "subscription-confirmation",
          context: {
            customerName: user.name || "Customer",
            plan: subscriptionPlan.name,
            amount,
            currency,
            billingCycle: billing_cycle.interval,
            nextBillingDate: new Date(next_billed_at).toLocaleDateString(),
            ...footerData
          },
          attachments: [
            {
              filename: `qurieus-invoice-${subscriptionId}.pdf`,
              content: invoicePDF,
            },
          ],
        });
      } catch (error) {
        console.error("Error generating invoice:", error);
        // Continue without the invoice if PDF generation fails
        await sendEmail({
          to: user.email,
          subject: "Welcome to Qurieus - Your Subscription Details",
          template: "subscription-confirmation",
          context: {
            customerName: user.name || "Customer",
            plan: subscriptionPlan.name,
            amount,
            currency,
            billingCycle: billing_cycle.interval,
            nextBillingDate: new Date(next_billed_at).toLocaleDateString(),
            ...footerData
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    //#region Subscription Updated
    if (event_type === "subscription.updated") {
      const {
        id: subscriptionId,
        status,
        items,
        next_billed_at,
        billing_cycle,
        currency,
        custom_data,
      } = data;

      const amount = items[0].price.unit_price.amount;

      const user = await prisma.user.findFirst({
        where: {
          id: custom_data.application_customer_id,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          paddleConfig: {
            priceId: items[0].price.id,
          },
        },
      });

      if (!subscriptionPlan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      await prisma.userSubscription.update({
        where: {
          userId: user.id,
        },
        data: {
          status,
          planId: subscriptionPlan.id,
          paddlePaymentAmount: parseFloat(amount),
          paddlePaymentCurrency: currency,
          nextBillingDate: new Date(next_billed_at),
          billingCycle: billing_cycle.interval,
        },
      });

      return NextResponse.json({ success: true });
    }
    //#endregion

    //#region Subscription Cancelled
    if (event_type === "subscription.cancelled") {
      const { id: subscriptionId, status } = data;

      await prisma.userSubscription.update({
        where: {
          paddleSubscriptionId: subscriptionId,
        },
        data: {
          status,
        },
      });

      return NextResponse.json({ success: true });
    }
    //#endregion

    //#region Subscription Activated
    if (event_type === "subscription.activated") {
      const {
        id: subscriptionId,
        status,
        items,
        next_billed_at,
        billing_cycle,
        currency,
        created_at,
        custom_data,
      } = data;

      const amount = items[0].price.unit_price.amount;

      const user = await prisma.user.findFirst({
        where: {
          id: custom_data.application_customer_id,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // First find the plan in our database
      const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          id: custom_data.application_plan_id,
        },
      });

      if (!subscriptionPlan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      await prisma.userSubscription.update({
        where: {
          userId: user.id,
        },
        data: {
          status,
          planId: subscriptionPlan.id,
          paddlePaymentAmount: amount ? parseFloat(amount) : 0,
          paddlePaymentCurrency: currency,
          nextBillingDate: new Date(next_billed_at),
          billingCycle: billing_cycle.interval,
          currentPeriodStart: new Date(created_at),
          currentPeriodEnd: new Date(next_billed_at),
          startDate: new Date(created_at),
        },
      });

      // await prisma.userSubscriptionupsert({
      //   where: {
      //     paddleSubscriptionId: subscriptionId,
      //   },
      //   create: {
      //     paddleSubscriptionId: subscriptionId,
      //     paddleCustomerId: customerId,
      //     status,
      //     paddlePaymentAmount: amount ? parseFloat(amount) : 0,
      //     paddlePaymentCurrency: currency,
      //     nextBillingDate: new Date(next_billed_at),
      //     billingCycle: billing_cycle.interval,
      //     startDate: new Date(created_at),
      //     currentPeriodStart: new Date(created_at),
      //     currentPeriodEnd: new Date(next_billed_at),
      //     userId: user.id,
      //     planId: subscriptionPlan.id
      //   },
      //   update: {
      //     status,
      //     paddlePaymentAmount: amount ? parseFloat(amount) : 0,
      //     paddlePaymentCurrency: currency,
      //     nextBillingDate: new Date(next_billed_at),
      //     billingCycle: billing_cycle.interval,
      //     currentPeriodStart: new Date(created_at),
      //     currentPeriodEnd: new Date(next_billed_at),
      //     planId: subscriptionPlan.id
      //   }
      // });

      return NextResponse.json({ success: true });
    }
    //#endregion

    //#region Transaction Completed
    if (event_type === "transaction.created") {
      const {
        id: transactionId,
        subscription_id: subscriptionId,
        status,
        items,
        billing_period,
        currency,
        created_at,
        custom_data,
        customer_id: customerId,
      } = data;

      const amount = items[0].price.unit_price.amount;
      const subscriptionPlanId = items[0].price.id;

      const user = await prisma.user.findFirst({
        where: {
          id: custom_data.application_customer_id,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          paddleConfig: {
            priceId: subscriptionPlanId,
          },
        },
      });

      if (!subscriptionPlan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      // Use upsert instead of update and remove the 404 return
      await prisma.userSubscription.upsert({
        where: {
          userId: user.id,
        },
        create: {
          userId: user.id,
          paddleSubscriptionId: subscriptionId,
          paddleCustomerId: customerId || custom_data.application_customer_id,
          status: status === "billed" ? "active" : "in-progress",
          planId: subscriptionPlan.id,
          paddlePaymentAmount: amount ? parseFloat(amount) : 0,
          paddlePaymentCurrency: currency,
          ...(billing_period?.ends_at && {
            nextBillingDate: new Date(billing_period.ends_at),
            currentPeriodEnd: new Date(billing_period.ends_at),
          }),
          currentPeriodStart: new Date(billing_period?.starts_at || created_at),
          startDate: new Date(billing_period?.starts_at || created_at),
        },
        update: {
          status: status === "billed" ? "active" : "in-progress",
          planId: subscriptionPlan.id,
          paddlePaymentAmount: amount ? parseFloat(amount) : 0,
          paddlePaymentCurrency: currency,
          ...(billing_period?.ends_at && {
            nextBillingDate: new Date(billing_period.ends_at),
            currentPeriodEnd: new Date(billing_period.ends_at),
          }),
          currentPeriodStart: new Date(billing_period?.starts_at || created_at),
          startDate: new Date(billing_period?.starts_at || created_at),
        },
      });

      return NextResponse.json({ success: true });
    }
    //#endregion

    //#region Subscription Paused
    if (event_type === "subscription.paused") {
      const { id: subscriptionId, status, custom_data } = data;

      await prisma.userSubscription.update({
        where: {
          paddleSubscriptionId: subscriptionId,
        },
        data: {
          status,
        },
      });

      return NextResponse.json({ success: true });
    }
    //#endregion

    //#region Subscription Unpaused
    if (event_type === "subscription.unpaused") {
      const { id: subscriptionId, status, custom_data } = data;

      await prisma.userSubscription.update({
        where: {
          paddleSubscriptionId: subscriptionId,
        },
        data: {
          status,
        },
      });

      return NextResponse.json({ success: true });
    }
    //#endregion

    //#region Subscription Unpaused
    if (event_type === "subscription.unpaused") {
      const { id: subscriptionId, status, custom_data } = data;

      await prisma.userSubscription.update({
        where: {
          paddleSubscriptionId: subscriptionId,
        },
        data: {
          status,
        },
      });
    }
    //#endregion

    //#region Subscription Expired
    if (event_type === "subscription.expired") {
      const { id: subscriptionId, status, custom_data } = data;

      await prisma.userSubscription.update({
        where: {
          paddleSubscriptionId: subscriptionId,
        },
        data: {
          status,
        },
      });

      return NextResponse.json({ success: true });
    }
    //#endregion
    return NextResponse.json(
      { error: "Unhandled event type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

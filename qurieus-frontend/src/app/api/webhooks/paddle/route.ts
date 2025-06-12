import { sendEmail } from "@/lib/email";
import { generateInvoicePDF } from "@/lib/invoice";
import { prisma } from "@/utils/prismaDB";
import { verifyPaddleWebhook } from "@/lib/paddle";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    // Verify the webhook signature
    const isValid = verifyPaddleWebhook(
      body,
      paddleSignature,
      process.env.PADDLE_WEBHOOK_SIGNING_KEY || ""
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    if (event_type === "subscription.created") {
      const {
        id: subscriptionId,
        customer_id: customerId,
        status,
        items,
        next_billed_at,
        billing_cycle,
        currency,
        created_at,
      } = data;

      const plan = items[0].price.product.name;
      const amount = items[0].price.unit_price.amount;

      const user = await prisma.user.findFirst({
        where: {
          id: customerId,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await prisma.subscription.create({
        data: {
          userId: user.id,
          paddleSubscriptionId: subscriptionId,
          paddleCustomerId: customerId,
          status,
          plan,
          paddlePaymentAmount: amount,
          paddlePaymentCurrency: currency,
          nextBillingDate: new Date(next_billed_at),
          billingCycle: billing_cycle.interval,
          startDate: new Date(created_at),
          currentPeriodStart: new Date(created_at),
          currentPeriodEnd: new Date(next_billed_at),
          planId: plan.id,
        },
      });

      const invoicePDF = await generateInvoicePDF({
        customerName: user.name || "Customer",
        customerEmail: user.email,
        subscriptionId,
        planName: plan,
        amount,
        currency,
        date: new Date(created_at),
        status,
      });

      await sendEmail({
        to: user.email,
        subject: "Welcome to Qurieus - Your Subscription Details",
        html: `
          <h1>Welcome to Qurieus!</h1>
          <p>Thank you for subscribing to our ${plan} plan.</p>
          <p>Your subscription details:</p>
          <ul>
            <li>Plan: ${plan}</li>
            <li>Amount: ${currency} ${amount}</li>
            <li>Billing Cycle: ${billing_cycle.interval}</li>
            <li>Next Billing Date: ${new Date(next_billed_at).toLocaleDateString()}</li>
          </ul>
          <p>Please find your invoice attached to this email.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        `,
        attachments: [
          {
            filename: `invoice-${subscriptionId}.pdf`,
            content: invoicePDF,
          },
        ],
      });

      return NextResponse.json({ success: true });
    }

    if (event_type === "subscription.updated") {
      const {
        id: subscriptionId,
        status,
        items,
        next_billed_at,
        billing_cycle,
        currency,
      } = data;

      const plan = items[0].price.product.name;
      const amount = items[0].price.unit_price.amount;

      await prisma.subscription.update({
        where: {
          paddleSubscriptionId: subscriptionId,
        },
        data: {
          status,
          plan,
          paddlePaymentAmount: amount,
          paddlePaymentCurrency: currency,
          nextBillingDate: new Date(next_billed_at),
          billingCycle: billing_cycle.interval,
        },
      });

      return NextResponse.json({ success: true });
    }

    if (event_type === "subscription.cancelled") {
      const { id: subscriptionId, status } = data;

      await prisma.subscription.update({
        where: {
          paddleSubscriptionId: subscriptionId,
        },
        data: {
          status,
        },
      });

      return NextResponse.json({ success: true });
    }

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

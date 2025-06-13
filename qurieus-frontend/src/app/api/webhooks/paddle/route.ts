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
        customer_id: customerId,
        status,
        items,
        next_billed_at,
        billing_cycle,
        currency,
        created_at,
        custom_data,
      } = data;

      const plan = items[0].product.name;
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
          name: plan
        }
      });

      if (!subscriptionPlan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      await prisma.subscription.create({
        data: {
          paddleSubscriptionId: subscriptionId,
          paddleCustomerId: customerId,
          status,
          paddlePaymentAmount:  amount ? parseFloat(amount) : 0,
          paddlePaymentCurrency: currency,
          nextBillingDate: new Date(next_billed_at),
          billingCycle: billing_cycle.interval,
          startDate: new Date(created_at),
          currentPeriodStart: new Date(created_at),
          currentPeriodEnd: new Date(next_billed_at),
          user: {
            connect: {
              id: user.id
            }
          },
          plan: {
            connect: {
              id: subscriptionPlan.id
            }
          }
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
          },
        });
      }

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

    if (event_type === "subscription.activated") {
      const {
        id: subscriptionId,
        status,
        items,
        next_billed_at,
        billing_cycle,
        currency,
        created_at,
      } = data;

      const plan = items[0].product.name;
      const amount = items[0].price.unit_price.amount;

      // First find the plan in our database
      const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
        where: {
          name: plan
        }
      });

      if (!subscriptionPlan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      await prisma.subscription.update({
        where: {
          paddleSubscriptionId: subscriptionId,
        },
        data: {
          status,
          paddlePaymentAmount: amount ? parseFloat(amount) : 0,
          paddlePaymentCurrency: currency,
          nextBillingDate: new Date(next_billed_at),
          billingCycle: billing_cycle.interval,
          currentPeriodStart: new Date(created_at),
          currentPeriodEnd: new Date(next_billed_at),
          plan: {
            connect: {
              id: subscriptionPlan.id
            }
          }
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

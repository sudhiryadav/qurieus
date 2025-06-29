import crypto from "crypto";
import axios from "axios";
import { prisma } from "@/utils/prismaDB";

export function verifyPaddleWebhook(
  body: any,
  signature: string,
  webhookKey: string
): boolean {
  try {
    // Paddle sends the signature in the format "ts=timestamp,v1=signature"
    const [timestamp, signatureValue] = signature.split(",");
    const [, timestampValue] = timestamp.split("=");
    const [, signatureHash] = signatureValue.split("=");

    // Create the string to verify
    const stringToVerify = `${timestampValue}:${JSON.stringify(body)}`;

    // Create HMAC
    const hmac = crypto.createHmac("sha256", webhookKey);
    const digest = hmac.update(stringToVerify).digest("hex");

    // Compare the signatures
    return crypto.timingSafeEqual(
      Buffer.from(signatureHash),
      Buffer.from(digest)
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

export async function fetchPaddleSubscription(subscriptionId: string) {
  const endpoint = process.env.NODE_ENV === "production"
    ? `https://api.paddle.com/subscriptions/${subscriptionId}`
    : `https://sandbox-api.paddle.com/subscriptions/${subscriptionId}`;

  const response = await axios.get(endpoint, {
    headers: {
      Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  return response.data.data;
}

export async function upsertUserSubscriptionFromPaddle(paddleSub: any, userId: string) {
  // Find the plan in our database
  const plan = await prisma.subscriptionPlan.findFirst({
    where: {
      paddleConfig: {
        priceId: paddleSub.items[0].price.id,
      },
    },
  });
  if (!plan) throw new Error("Plan not found for Paddle subscription");

  return prisma.userSubscription.upsert({
    where: { paddleSubscriptionId: paddleSub.id },
    create: {
      paddleSubscriptionId: paddleSub.id,
      paddleCustomerId: paddleSub.customer_id,
      status: paddleSub.status, 
      paddlePaymentAmount: paddleSub.items[0].price.unit_price.amount ? parseFloat(paddleSub.items[0].price.unit_price.amount) : 0,
      paddlePaymentCurrency: paddleSub.items[0].price.unit_price.currency,
      nextBillingDate: new Date(paddleSub.next_billed_at),
      billingCycle: paddleSub.billing_cycle.interval,
      startDate: new Date(paddleSub.created_at),
      currentPeriodStart: new Date(paddleSub.created_at),
      currentPeriodEnd: new Date(paddleSub.next_billed_at),
      userId,
      planId: plan.id,
    },
    update: {
      status: paddleSub.status,
      paddlePaymentAmount: paddleSub.items[0].price.unit_price.amount ? parseFloat(paddleSub.items[0].price.unit_price.amount) : 0,
      paddlePaymentCurrency: paddleSub.items[0].price.unit_price.currency,
      nextBillingDate: new Date(paddleSub.next_billed_at),
      billingCycle: paddleSub.billing_cycle.interval,
      currentPeriodStart: new Date(paddleSub.created_at),
      currentPeriodEnd: new Date(paddleSub.next_billed_at),
      planId: plan.id,
    },
  });
} 
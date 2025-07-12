import axios from "axios";
import { prisma } from "@/utils/prismaDB";
import { EventName, LogLevel, Environment, Paddle } from "@paddle/paddle-node-sdk";
import { logger } from "@/lib/logger";

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.NODE_ENV === "production"
      ? Environment.production
      : Environment.sandbox,
  logLevel: LogLevel.verbose,
});

// Re-export EventName for easier imports
export { EventName };

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
  let plan = await prisma.subscriptionPlan.findFirst({
    where: {
      paddleConfig: {
        priceId: paddleSub.items[0].price.id,
      },
    },
  });

  // If not found by price ID, try to find by plan name
  if (!plan && paddleSub.items[0]?.price?.name) {
    logger.info("Plan not found by price ID, trying to find by name:", { priceName: paddleSub.items[0].price.name });
    plan = await prisma.subscriptionPlan.findFirst({
      where: {
        name: paddleSub.items[0].price.name,
      },
    });
  }

  if (!plan) {
    logger.error("Plan not found for Paddle subscription", { paddleSub });
    throw new Error(`Plan not found for Paddle subscription. Price ID: ${paddleSub.items[0]?.price?.id}, Price Name: ${paddleSub.items[0]?.price?.name}`);
  }

  logger.info("Found plan", { planName: plan.name });

  // Create plan snapshot for new subscriptions
  const planSnapshot = {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    currency: plan.currency,
    features: plan.features,
    idealFor: plan.idealFor,
    keyLimits: plan.keyLimits,
    maxDocs: plan.maxDocs,
    maxStorageMB: plan.maxStorageMB,
    maxQueriesPerDay: plan.maxQueriesPerDay,
    snapshotDate: new Date().toISOString()
  };

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
      planSnapshot: planSnapshot,
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

export default paddle;
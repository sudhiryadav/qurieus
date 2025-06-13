import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { Subscription } from "@prisma/client";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const {
    paddleSubscriptionId,
    paddleCustomerId,
    planId,
    status,
    currentPeriodStart,
    currentPeriodEnd,
    paddlePaymentAmount,
    paddlePaymentCurrency,
    startDate,
    nextBillingDate,
    billingCycle,
  } = data;

  if (
    !paddleSubscriptionId ||
    !paddleCustomerId ||
    !planId ||
    !status ||
    !currentPeriodStart ||
    !currentPeriodEnd
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get plan details to set planName
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const subscriptionData = {
    user: {
      connect: {
        id: user.id,
      },
    },
    plan: {
      connect: {
        id: planId,
      },
    },
    paddleSubscriptionId,
    paddleCustomerId,
    status,
    currentPeriodStart: new Date(currentPeriodStart),
    currentPeriodEnd: new Date(currentPeriodEnd),
    startDate: new Date(startDate),
    nextBillingDate: new Date(nextBillingDate),
    billingCycle,
    paddlePaymentAmount,
    paddlePaymentCurrency,
  };

  const subscription = await prisma.subscription.create({
    data: subscriptionData,
  });

  return NextResponse.json({ subscription });
}

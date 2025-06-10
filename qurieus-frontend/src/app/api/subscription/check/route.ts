import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/utils/prismaDB";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const subscription = user.subscription;
  if (!subscription) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  // Cast subscription to 'any' to bypass TypeScript's strict type checking
  const subscriptionAny = subscription as any;

  return NextResponse.json({
    subscription: {
      id: subscriptionAny.id,
      planId: subscriptionAny.planId,
      planName: subscriptionAny.plan.name,
      status: subscriptionAny.status,
      paddleSubscriptionId: subscriptionAny.paddleSubscriptionId,
      paddleCustomerId: subscriptionAny.paddleCustomerId,
      currentPeriodStart: subscriptionAny.currentPeriodStart,
      currentPeriodEnd: subscriptionAny.currentPeriodEnd,
      cancelledAt: subscriptionAny.cancelledAt,
      paddlePaymentId: subscriptionAny.paddlePaymentId,
      paddlePaymentAmount: subscriptionAny.paddlePaymentAmount,
      paddlePaymentDate: subscriptionAny.paddlePaymentDate,
      paddlePaymentError: subscriptionAny.paddlePaymentError,
    },
  });
} 
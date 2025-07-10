import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";
import { activateSubscription } from "@/utils/subscription";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, planId } = await req.json();
    if (!priceId || !planId) {
      return NextResponse.json(
        { error: "Price ID and Plan ID are required" },
        { status: 400 }
      );
    }

    // Get user's subscription and plan
    const [userSubscription, plan] = await Promise.all([
      prisma.userSubscription.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.subscriptionPlan.findFirst({
        where: { id: planId }
      })
    ]);

    if (!userSubscription?.paddleCustomerId) {
      return NextResponse.json(
        { error: "No payment method found. Please use checkout." },
        { status: 400 }
      );
    }

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Case 1: User has existing subscription - UPDATE it
    if (userSubscription.paddleSubscriptionId && !userSubscription.paddleSubscriptionId.startsWith('trial_')) {
      try {
        const updateResponse = await paddle.subscriptions.update(userSubscription.paddleSubscriptionId, {
          prorationBillingMode: "prorated_immediately",
          items: [{ priceId, quantity: 1 }]
        });

        // Activate this subscription and deactivate others
        await activateSubscription(userSubscription.id, session.user.id, {
          planId: plan.id,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        return NextResponse.json({
          success: true,
          subscription: updateResponse,
          message: "Subscription updated successfully"
        });
      } catch (error) {
        console.error("Subscription update failed:", error);
        return NextResponse.json({
          success: false,
          needsCheckout: true,
          message: "Update failed. Please use checkout."
        });
      }
    }

    // Case 2: User exists in Paddle but no subscription - use checkout
    return NextResponse.json({
      success: false,
      needsCheckout: true,
      message: "Please use checkout to create new subscription"
    });

  } catch (error) {
    console.error("Error processing direct payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
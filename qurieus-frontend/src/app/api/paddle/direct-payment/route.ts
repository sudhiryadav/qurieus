import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";

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

    // Get user's existing subscription to find Paddle customer ID
    const userSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!userSubscription?.paddleCustomerId) {
      return NextResponse.json(
        { error: "No existing payment method found. Please use checkout." },
        { status: 400 }
      );
    }

    // Get the plan details
    const plan = await prisma.subscriptionPlan.findFirst({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    try {
      // For users with existing payment methods, we'll use a different approach
      // Instead of creating subscription directly, we'll update their existing subscription
      // if they have one, or create a checkout session that pre-fills their payment method
      
      if (userSubscription.paddleSubscriptionId && userSubscription.paddleSubscriptionId !== 'trial_') {
        // User has an existing paid subscription, update it
        const response = await paddle.subscriptions.update(userSubscription.paddleSubscriptionId, {
          prorationBillingMode: "prorated_immediately",
          items: [
            {
              priceId: priceId,
              quantity: 1
            }
          ]
        });

        // Update the user's subscription in our database
        await prisma.userSubscription.update({
          where: {
            id: userSubscription.id,
          },
          data: {
            planId: plan.id,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        return NextResponse.json({
          success: true,
          subscription: response,
          message: "Subscription updated successfully using existing payment method"
        });
      } else {
        // User has payment method but no active subscription, need to use checkout
        return NextResponse.json({
          success: false,
          needsCheckout: true,
          message: "Please use checkout to create new subscription"
        });
      }

    } catch (paddleError) {
      console.error("Paddle direct payment error:", paddleError);
      return NextResponse.json(
        { error: "Failed to process payment. Please try the checkout instead." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error processing direct payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
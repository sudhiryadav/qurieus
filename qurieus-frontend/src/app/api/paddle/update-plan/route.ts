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

    const { subscriptionId, priceId } = await req.json();
    if (!subscriptionId || !priceId) {
      return NextResponse.json(
        { error: "Subscription ID and Price ID are required" },
        { status: 400 }
      );
    }

    // Verify the subscription belongs to the current user
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        paddleSubscriptionId: subscriptionId,
        userId: session.user.id,
      },
    }) as any;

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Check if this is a trial subscription or free tier
    const planSnapshot = subscription.planSnapshot as { price?: number } | null;
    const isTrialSubscription = subscription.paddleSubscriptionId?.startsWith('trial_') || subscription.billingCycle === 'trial';
    const isFreeTier = !subscription.paddleSubscriptionId || (planSnapshot && planSnapshot.price === 0);
    
    if (isTrialSubscription || isFreeTier) {
      // For trial subscriptions or free tiers, redirect to Paddle checkout
      // This should not happen as the frontend should handle this case
      return NextResponse.json(
        { error: "Trial subscriptions should use Paddle checkout, not update-plan API" },
        { status: 400 }
      );
    }

    // Update the subscription in our database to set that status as in progress    
    await prisma.userSubscription.update({
      where: {
        id: subscription.id
      },
      data: {
        status: "in_progress"
      }
    });

    // Call Paddle API to update the subscription using SDK
    const response = await paddle.subscriptions.update(subscriptionId, {
      prorationBillingMode: "prorated_immediately",
        items: [
          {
          priceId: priceId,
            quantity: 1
          }
        ]
    });

    return NextResponse.json({ 
      success: true, 
      subscription: response 
    });
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    // Return more specific error messages
    if (error.response?.status === 405) {
      return NextResponse.json(
        { error: "Invalid API endpoint or method. Please check Paddle configuration." },
        { status: 500 }
      );
    }
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: "Paddle API authentication failed. Please check API key." },
        { status: 500 }
      );
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: "Subscription or customer not found in Paddle." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to update subscription" },
      { status: error.response?.status || 500 }
    );
  }
} 
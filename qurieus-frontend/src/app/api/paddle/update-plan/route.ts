import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";
import { logger } from "@/lib/logger";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { buildPaddleCustomData } from "@/lib/paddleProduct";

export const POST = RequireRoles([UserRole.USER])(async (req: Request) => {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    userId = session!.user!.id;
    const { subscriptionId, priceId } = await req.json();
    
    logger.info("Paddle Update Plan API: Processing plan update", { 
      userId, 
      subscriptionId, 
      priceId 
    });

    if (!subscriptionId || !priceId) {
      logger.warn("Paddle Update Plan API: Missing required fields", { 
        userId, 
        hasSubscriptionId: !!subscriptionId, 
        hasPriceId: !!priceId 
      });
      return NextResponse.json(
        { error: "Subscription ID and Price ID are required" },
        { status: 400 }
      );
    }

    // Verify the subscription belongs to the current user
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        paddleSubscriptionId: subscriptionId,
        userId: session!.user!.id,
      },
      include: {
        plan: true,
      },
    }) as any;

    if (!subscription) {
      logger.warn("Paddle Update Plan API: Subscription not found", { 
        userId, 
        subscriptionId 
      });
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
      logger.warn("Paddle Update Plan API: Attempted to update trial/free subscription", { 
        userId, 
        subscriptionId,
        isTrialSubscription,
        isFreeTier 
      });
      // For trial subscriptions or free tiers, redirect to Paddle checkout
      // This should not happen as the frontend should handle this case
      return NextResponse.json(
        { error: "Trial subscriptions should use Paddle checkout, not update-plan API" },
        { status: 400 }
      );
    }

    logger.info("Paddle Update Plan API: Updating subscription status to in_progress", { 
      userId, 
      subscriptionId 
    });

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
    logger.info("Paddle Update Plan API: Calling Paddle API to update subscription", { 
      userId, 
      subscriptionId, 
      priceId 
    });
    
    const response = await paddle.subscriptions.update(subscriptionId, {
      prorationBillingMode: "prorated_immediately",
        items: [
          {
          priceId: priceId,
            quantity: 1
          }
        ],
      customData: buildPaddleCustomData({
        application_customer_id: session!.user!.id,
        application_customer_email: session!.user!.email,
        application_plan_id: subscription.planId,
        tenantId: session!.user!.id,
        practiceId: session!.user!.id,
        orderId: `update_plan_${session!.user!.id}_${Date.now()}`,
        plan: subscription.plan?.name || subscription.planId,
      }),
    });

    const responseTime = Date.now() - startTime;
    logger.info("Paddle Update Plan API: Plan updated successfully", { 
      userId, 
      subscriptionId, 
      responseTime 
    });

    return NextResponse.json({ 
      success: true, 
      subscription: response 
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Paddle Update Plan API: Error updating subscription", { 
      userId, 
      subscriptionId: error.config?.data?.subscriptionId,
      error: error.message, 
      responseTime,
      stack: error.stack 
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
}); 
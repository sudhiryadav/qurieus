import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";
import { activateSubscription } from "@/utils/subscription";
import { logger } from "@/lib/logger";
import { buildPaddleCustomData } from "@/lib/paddleProduct";

export async function POST(req: Request) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = session.user.id;
    const { priceId, planId, checkoutAttemptId } = await req.json();
    
    logger.info("Paddle Direct Payment API: Processing direct payment", { 
      userId, 
      priceId, 
      planId,
      checkoutAttemptId: checkoutAttemptId || null,
      nodeEnv: process.env.NODE_ENV,
      hasPaddleApiKey: !!process.env.PADDLE_API_KEY,
    });

    if (!priceId || !planId) {
      logger.warn("Paddle Direct Payment API: Missing required fields", { 
        userId, 
        hasPriceId: !!priceId, 
        hasPlanId: !!planId 
      });
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
      logger.info("Paddle Direct Payment API: Updating existing subscription", { 
        userId, 
        subscriptionId: userSubscription.paddleSubscriptionId,
        checkoutAttemptId: checkoutAttemptId || null,
      });
      
      try {
        const updateResponse = await paddle.subscriptions.update(userSubscription.paddleSubscriptionId, {
          prorationBillingMode: "prorated_immediately",
          items: [{ priceId, quantity: 1 }],
          customData: buildPaddleCustomData({
            application_customer_id: session.user.id,
            application_customer_email: session.user.email,
            application_plan_id: plan.id,
            tenantId: session.user.id,
            practiceId: session.user.id,
            orderId: `direct_payment_${session.user.id}_${Date.now()}`,
            plan: plan.name,
          }),
        });

        // Activate this subscription and deactivate others
        await activateSubscription(userSubscription.id, session.user.id, {
            planId: plan.id,
            currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        const responseTime = Date.now() - startTime;
        logger.info("Paddle Direct Payment API: Subscription updated successfully", { 
          userId, 
          subscriptionId: userSubscription.paddleSubscriptionId,
          responseTime,
          checkoutAttemptId: checkoutAttemptId || null,
        });

        return NextResponse.json({
          success: true,
          subscription: updateResponse,
          message: "Subscription updated successfully"
        });
      } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error("Paddle Direct Payment API: Subscription update failed", { 
          userId, 
          subscriptionId: userSubscription.paddleSubscriptionId,
          error: error instanceof Error ? error.message : String(error),
          responseTime,
          checkoutAttemptId: checkoutAttemptId || null,
        });
        
        return NextResponse.json({
          success: false,
          needsCheckout: true,
          message: "Update failed. Please use checkout."
        });
      }
    }

    // Case 2: User exists in Paddle but no subscription - use checkout
    logger.info("Paddle Direct Payment API: No existing subscription, redirecting to checkout", {
      userId,
      checkoutAttemptId: checkoutAttemptId || null,
    });
    
    return NextResponse.json({
      success: false,
      needsCheckout: true,
      message: "Please use checkout to create new subscription"
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Paddle Direct Payment API: Error processing direct payment", { 
      userId, 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
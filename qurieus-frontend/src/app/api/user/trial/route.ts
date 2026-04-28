import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { ensureSingleActiveSubscription } from "@/utils/subscription";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const POST = RequireRoles([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    // Check if user already has a subscription
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session!.user!.id,
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "User already has a subscription" },
        { status: 400 }
      );
    }

    // Find the Free Trial plan
    const freeTrialPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        name: "Free Trial",
        isActive: true,
      },
    });

    if (!freeTrialPlan) {
      return NextResponse.json(
        { error: "Free Trial plan not found" },
        { status: 404 }
      );
    }

    // Calculate trial end date based on plan description (e.g., "7 days")
    const trialDays = parseInt(freeTrialPlan.description) || 7;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    // Deactivate all other subscriptions for this user
    await ensureSingleActiveSubscription(session!.user!.id);

    // Create trial subscription
    const trialSubscription = await prisma.userSubscription.create({
      data: {
        userId: session!.user!.id,
        planId: freeTrialPlan.id,
        paddleSubscriptionId: `trial_${session!.user!.id}_${Date.now()}`,
        paddleCustomerId: "",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndDate,
        startDate: new Date(),
        nextBillingDate: trialEndDate,
        billingCycle: "trial",
        paddlePaymentAmount: 0,
        paddlePaymentCurrency: "INR",
        planSnapshot: {
          name: freeTrialPlan.name,
          price: freeTrialPlan.price,
          currency: freeTrialPlan.currency,
          features: freeTrialPlan.features,
          maxDocs: freeTrialPlan.maxDocs,
          maxStorageMB: freeTrialPlan.maxStorageMB,
          maxQueriesPerDay: freeTrialPlan.maxQueriesPerDay,
          idealFor: freeTrialPlan.idealFor,
          keyLimits: freeTrialPlan.keyLimits,
          description: freeTrialPlan.description,
        },
      },
      include: {
        plan: true,
        user: true,
      },
    });

    // Send trial started email using existing email service
    try {
      const { sendTrialStartedEmail } = await import("@/lib/email");
      await sendTrialStartedEmail({
        email: session!.user!.email!,
        name: session!.user!.name || session!.user!.email!,
        trial_days: trialDays,
        trial_end_date: trialEndDate.toLocaleDateString(),
        max_docs: freeTrialPlan.maxDocs || 5,
        max_storage: freeTrialPlan.maxStorageMB || 10,
        max_queries: freeTrialPlan.maxQueriesPerDay || 25,
      });
    } catch (emailError) {
      // Don't fail the trial creation if email fails
    }

    return NextResponse.json({
      success: true,
      subscription: trialSubscription,
      message: `Free trial started successfully. Trial ends in ${trialDays} days.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

export const GET = RequireRoles([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    // Get current subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session!.user!.id,
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(null);
    }

    // Check if trial has expired
    if (subscription.plan.name === "Free Trial" && subscription.currentPeriodEnd < new Date()) {
      // Update subscription status to expired
      await prisma.userSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "expired",
        },
      });

      return NextResponse.json({
        ...subscription,
        status: "expired",
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 
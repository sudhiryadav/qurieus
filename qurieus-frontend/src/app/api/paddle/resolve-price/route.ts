import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId, checkoutAttemptId } = await req.json();
    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    logger.info("Paddle Resolve Price API: resolving", {
      checkoutAttemptId: checkoutAttemptId || null,
      userId: session.user.id,
      planId,
      nodeEnv: process.env.NODE_ENV,
      hasPaddleApiKey: !!process.env.PADDLE_API_KEY,
      paddleApiKeyPrefix: (process.env.PADDLE_API_KEY || "").slice(0, 12),
    });

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { paddleConfig: true },
    });

    if (!plan) {
      logger.warn("Paddle Resolve Price API: plan not found", {
        checkoutAttemptId: checkoutAttemptId || null,
        planId,
      });
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.paddleConfig?.priceId) {
      logger.info("Paddle Resolve Price API: existing mapping found", {
        checkoutAttemptId: checkoutAttemptId || null,
        planId,
        productId: plan.paddleConfig.productId,
        priceId: plan.paddleConfig.priceId,
      });
      return NextResponse.json({
        success: true,
        priceId: plan.paddleConfig.priceId,
        productId: plan.paddleConfig.productId,
      });
    }

    const productsIterator = paddle.products.list();
    const products = [];
    for await (const p of productsIterator as any) {
      products.push(p);
    }

    const matchingProduct = products.find((p: any) => p.name === plan.name);
    if (!matchingProduct) {
      logger.warn("Paddle Resolve Price API: product not found", {
        checkoutAttemptId: checkoutAttemptId || null,
        planId,
        planName: plan.name,
        productsCount: products.length,
      });
      return NextResponse.json(
        { error: `No Paddle product found for plan '${plan.name}'` },
        { status: 404 },
      );
    }

    const pricesIterator = paddle.prices.list({
      productId: [matchingProduct.id],
    });
    const prices = [];
    for await (const price of pricesIterator as any) {
      prices.push(price);
    }

    const matchingPrice = prices.find(
      (p: any) =>
        p.name === plan.name ||
        p.description === plan.name ||
        p.description === plan.description,
    );

    if (!matchingPrice?.id) {
      logger.warn("Paddle Resolve Price API: price not found", {
        checkoutAttemptId: checkoutAttemptId || null,
        planId,
        planName: plan.name,
        productId: matchingProduct.id,
        pricesCount: prices.length,
      });
      return NextResponse.json(
        { error: `No Paddle price found for plan '${plan.name}'` },
        { status: 404 },
      );
    }

    const paddleConfig = await prisma.paddleConfig.upsert({
      where: { subscriptionPlanId: plan.id },
      update: {
        productId: matchingProduct.id,
        priceId: matchingPrice.id,
      },
      create: {
        subscriptionPlanId: plan.id,
        productId: matchingProduct.id,
        priceId: matchingPrice.id,
        trialDays: 7,
        billingCycle: "monthly",
      },
    });

    logger.info("Paddle Resolve Price API: mapping upserted", {
      checkoutAttemptId: checkoutAttemptId || null,
      planId,
      productId: paddleConfig.productId,
      priceId: paddleConfig.priceId,
    });

    return NextResponse.json({
      success: true,
      priceId: paddleConfig.priceId,
      productId: paddleConfig.productId,
    });
  } catch (error: any) {
    logger.error("Paddle Resolve Price API: failed", {
      error: error?.message || String(error),
      stack: error?.stack,
    });
    return NextResponse.json(
      { error: error?.message || "Failed to resolve Paddle price" },
      { status: 500 },
    );
  }
}

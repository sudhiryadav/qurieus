import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment:
    process.env.NODE_ENV === "production"
      ? Environment.production
      : Environment.sandbox,
});

export async function POST(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const { params } = context;
  const awaitedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  });
  if (!user || user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: awaitedParams.id },
  });
  if (!plan)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  const paddleConfig = await prisma.paddleConfig.findUnique({
    where: { subscriptionPlanId: plan.id },
  });
  if (!paddleConfig || !paddleConfig.productId)
    return NextResponse.json({ error: "No Paddle productId" }, { status: 400 });

  let priceId = paddleConfig.priceId;
  let price;
  try {
    if (!priceId) {
      // Create new Paddle price
      price = await paddle.prices.create({
        productId: paddleConfig.productId,
        unitPrice: {
          amount: String(plan.price * 100),
          currencyCode: plan.currency as any,
        },
        description: plan.description || plan.name,
        name: plan.name || plan.description,
        billingCycle: {
          interval: "month",
          frequency: 1,
        },
      });
      priceId = price.id;
    } else {
      // Update existing Paddle price
      price = await paddle.prices.update(priceId, {
        unitPrice: {
          amount: String(plan.price * 100),
          currencyCode: plan.currency as any,
        },
        description: plan.description || plan.name,
        name: plan.name || plan.description,
        billingCycle: {
          interval: "month",
          frequency: 1,
        },
      });
    }
  } catch (err: any) {
    // Log error to DB, including which Paddle API was called
    await prisma.log.create({
      data: {
        userId: user.id,
        level: "error",
        message: `Paddle price sync failed for plan ${plan.id}`,
        meta: {
          error: err?.message || err,
          detail: err,
          paddleApi: !priceId ? "prices.create" : "prices.update",
          request: !priceId
            ? {
                productId: paddleConfig.productId,
                unitPrice: {
                  amount: String(plan.price * 100),
                  currencyCode: plan.currency as any,
                },
                description: plan.description,
                billingCycle: {
                  interval: "month",
                  frequency: 1,
                },
              }
            : {
                priceId,
                unitPrice: {
                  amount: String(plan.price * 100),
                  currencyCode: plan.currency as any,
                },
                description: plan.description,
                billingCycle: {
                  interval: "month",
                  frequency: 1,
                },
              },
        },
      },
    });
    return NextResponse.json(
      { error: `Paddle price sync failed: ${err?.message || err}` },
      { status: 500 },
    );
  }

  await prisma.paddleConfig.update({
    where: { subscriptionPlanId: plan.id },
    data: { priceId },
  });

  return NextResponse.json({ priceId });
}

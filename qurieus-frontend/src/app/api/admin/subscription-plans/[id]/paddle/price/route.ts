import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/utils/prismaDB";
import { Paddle } from "@paddle/paddle-node-sdk";

const paddle = new Paddle(process.env.PADDLE_API_KEY!);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  });
  if (!user || user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: params.id },
  });
  if (!plan)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  const paddleConfig = await prisma.paddleConfig.findUnique({
    where: { subscriptionPlanId: plan.id },
  });
  if (!paddleConfig || !paddleConfig.productId)
    return NextResponse.json({ error: "No Paddle productId" }, { status: 400 });

  // Create or update Paddle price
  const price = await paddle.prices.create({
    productId: paddleConfig.productId,
    unitPrice: { amount: plan.price, currencyCode: plan.currency },
    description: plan.description,
    billingCycle: "month" as any, // TODO: Use correct Paddle SDK type for billingCycle
  });

  await prisma.paddleConfig.update({
    where: { subscriptionPlanId: plan.id },
    data: { priceId: price.id },
  });

  return NextResponse.json({ priceId: price.id });
}

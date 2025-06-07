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

  // Create or update Paddle product
  const product = await paddle.products.create({
    name: plan.name,
    description: plan.description,
    taxCategory: "standard",
    type: null,
  });

  await prisma.paddleConfig.upsert({
    where: { subscriptionPlanId: plan.id },
    update: { productId: product.id },
    create: {
      subscriptionPlanId: plan.id,
      productId: product.id,
      priceId: "",
      trialDays: 7,
      billingCycle: "monthly",
    },
  });

  return NextResponse.json({ productId: product.id });
}

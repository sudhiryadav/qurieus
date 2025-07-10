import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  });
  if (!user || user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: id },
  });
  if (!plan)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  // Skip Paddle sync for Free Trial plans
  if (plan.name === "Free Trial") {
    return NextResponse.json({ 
      message: "Free Trial plans are not synced to Paddle. Use trial days on paid plans instead.",
      productId: null 
    });
  }

  let paddleConfig = await prisma.paddleConfig.findUnique({
    where: { subscriptionPlanId: plan.id },
  });

  let productId = paddleConfig?.productId;
  let product;
  try {
    if (!productId) {
      // Create new Paddle product
      product = await paddle.products.create({
        name: plan.name,
        description: plan.description,
        taxCategory: "standard",
      });
      productId = product.id;
    } else {
      // Update existing Paddle product
      product = await paddle.products.update(productId, {
        name: plan.name,
        description: plan.description,
        taxCategory: "standard",
      });
    }
  } catch (err: any) {
    // Log error to DB, including which Paddle API was called
    await prisma.log.create({
      data: {
        userId: user.id,
        level: "error",
        message: `Paddle product sync failed for plan ${plan.id}`,
        meta: {
          error: err?.message || err,
          detail: err,
          paddleApi: !productId ? "products.create" : "products.update",
          request: !productId
            ? { name: plan.name, description: plan.description, taxCategory: "standard", type: null }
            : { productId, name: plan.name, description: plan.description, taxCategory: "standard", type: null },
        },
      },
    });
    return NextResponse.json({ error: `Paddle product sync failed: ${err?.message || err}` }, { status: 500 });
  }

  await prisma.paddleConfig.upsert({
    where: { subscriptionPlanId: plan.id },
    update: { productId },
    create: {
      subscriptionPlanId: plan.id,
      productId,
      priceId: "",
      trialDays: 7,
      billingCycle: "monthly",
    },
  });

  return NextResponse.json({ productId });
}

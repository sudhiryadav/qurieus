import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || user.role !== "SUPER_ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: id },
      include: {
        paddleConfig: true,
      },
    });

    if (!plan) {
      return new NextResponse("Plan not found", { status: 404 });
    }

    return NextResponse.json(
      plan.paddleConfig || {
        productId: "",
        priceId: "",
        trialDays: 0,
        billingCycle: "monthly",
      },
    );
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || user.role !== "SUPER_ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { productId, priceId, trialDays, billingCycle } = body;
    const normalizedProductId = typeof productId === "string" ? productId.trim() : "";
    const normalizedPriceId = typeof priceId === "string" ? priceId.trim() : "";
    const normalizedTrialDays =
      typeof trialDays === "number" && Number.isInteger(trialDays) ? trialDays : 0;
    const normalizedBillingCycle =
      billingCycle === "monthly" || billingCycle === "yearly" ? billingCycle : "monthly";

    if (!normalizedProductId || !normalizedPriceId) {
      return NextResponse.json({ error: "Invalid Paddle product/price IDs" }, { status: 400 });
    }
    if (normalizedTrialDays < 0 || normalizedTrialDays > 365) {
      return NextResponse.json({ error: "Invalid trial days value" }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: id },
      include: {
        paddleConfig: true,
      },
    });

    if (!plan) {
      return new NextResponse("Plan not found", { status: 404 });
    }

    const updatedConfig = await prisma.paddleConfig.upsert({
      where: {
        subscriptionPlanId: id,
      },
      create: {
        subscriptionPlanId: id,
        productId: normalizedProductId,
        priceId: normalizedPriceId,
        trialDays: normalizedTrialDays,
        billingCycle: normalizedBillingCycle,
      },
      update: {
        productId: normalizedProductId,
        priceId: normalizedPriceId,
        trialDays: normalizedTrialDays,
        billingCycle: normalizedBillingCycle,
      },
    });

    return NextResponse.json(updatedConfig);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/utils/prismaDB";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
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
      where: { id: params.id },
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
    console.error("Error fetching Paddle configuration:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
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

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: params.id },
      include: {
        paddleConfig: true,
      },
    });

    if (!plan) {
      return new NextResponse("Plan not found", { status: 404 });
    }

    const updatedConfig = await prisma.paddleConfig.upsert({
      where: {
        subscriptionPlanId: params.id,
      },
      create: {
        subscriptionPlanId: params.id,
        productId,
        priceId,
        trialDays,
        billingCycle,
      },
      update: {
        productId,
        priceId,
        trialDays,
        billingCycle,
      },
    });

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Error updating Paddle configuration:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import axiosInstance from "@/lib/axios";

// Helper to sync a plan to Paddle (product + price)
async function syncPlanToPaddle(planId: string) {
  try {
    // Call product sync endpoint
    await axiosInstance.get(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/subscription-plans/${planId}/paddle/product`);
    // Call price sync endpoint
    await axiosInstance.get(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/subscription-plans/${planId}/paddle/price`);
  } catch (err) {
    console.error("Paddle sync failed for plan", planId, err);
  }
}

export async function GET() {
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
    const plans = await prisma.subscriptionPlan?.findMany({
      include: {
        paddleConfig: true,
      },
      orderBy: { price: "asc" }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
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
    const { name, description, price, currency, features, isActive, idealFor, keyLimits, maxDocs, maxStorageMB, maxQueriesPerDay } = body;
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        price,
        currency,
        features,
        isActive,
        idealFor,
        keyLimits,
        maxDocs,
        maxStorageMB,
        maxQueriesPerDay,
      },
    });
    // Auto-sync to Paddle
    await syncPlanToPaddle(plan.id);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
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
    const { id, name, description, price, currency, features, isActive, idealFor, keyLimits, maxDocs, maxStorageMB, maxQueriesPerDay } = body;
    if (!id) return NextResponse.json({ error: "Missing plan id" }, { status: 400 });
    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name,
        description,
        price,
        currency,
        features,
        isActive,
        idealFor,
        keyLimits,
        maxDocs,
        maxStorageMB,
        maxQueriesPerDay,
      },
    });
    // Auto-sync to Paddle
    await syncPlanToPaddle(plan.id);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
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
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing plan id" }, { status: 400 });
    await prisma.subscriptionPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

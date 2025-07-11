import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";

// Helper to sync a plan to Paddle (product + price)
async function syncPlanToPaddle(planId: string, userId: string) {
  try {
    // Fetch the plan to check if it is a free trial or free tier
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.name === "Free Trial" || plan.price === 0) {
      // Skip Paddle sync for free trial or free tier plans
      // Also remove any existing Paddle config for free plans
      await prisma.paddleConfig.deleteMany({
        where: { subscriptionPlanId: planId }
      });
      return;
    }

    // Sync product to Paddle
    let paddleConfig = await prisma.paddleConfig.findUnique({
      where: { subscriptionPlanId: plan.id },
    });

    let productId = paddleConfig?.productId;
    let product;
    
    // Create or update Paddle product
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
      // Log error to DB
      await prisma.log.create({
        data: {
          userId: userId,
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
      throw err;
    }

    // Update or create PaddleConfig with product ID
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

    // Sync price to Paddle
    if (!paddleConfig || !paddleConfig.productId) {
      paddleConfig = await prisma.paddleConfig.findUnique({
        where: { subscriptionPlanId: plan.id },
      });
    }

    if (!paddleConfig || !paddleConfig.productId) {
      throw new Error("No Paddle productId available for price sync");
    }

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
      // Log error to DB
      await prisma.log.create({
        data: {
          userId: userId,
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
      throw err;
    }

    // Update PaddleConfig with price ID
    await prisma.paddleConfig.update({
      where: { subscriptionPlanId: plan.id },
      data: { priceId },
    });

  } catch (err) {
    console.error("Paddle sync failed for plan", planId, err);
    throw err;
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
    try {
      await syncPlanToPaddle(plan.id, user.id);
    } catch (syncError) {
      console.error("Paddle sync failed:", syncError);
      // Don't fail the entire request if Paddle sync fails
      // The plan creation was successful, just the sync failed
    }
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
    try {
      await syncPlanToPaddle(plan.id, user.id);
    } catch (syncError) {
      console.error("Paddle sync failed:", syncError);
      // Don't fail the entire request if Paddle sync fails
      // The plan update was successful, just the sync failed
    }
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
    
    // Set the plan as inactive instead of deleting it
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false }
    });
    
    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error("Error deactivating subscription plan:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

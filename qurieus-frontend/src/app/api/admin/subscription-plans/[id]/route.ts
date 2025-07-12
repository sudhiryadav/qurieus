import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";
import { logger } from "@/lib/logger";

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
    
    // First, try to find existing product by name if we don't have a productId
    if (!productId) {
      try {
        const productsResponse = await paddle.products.list();
        const products = [];
        for await (const p of productsResponse) {
          products.push(p);
        }
        
        const existingProduct = products.find((p: any) => p.name === plan.name);
        if (existingProduct) {
          productId = existingProduct.id;
          logger.info(`Found existing Paddle product with name "${plan.name}": ${productId}`);
        }
      } catch (err) {
        logger.error("Could not search for existing products:", err);
      }
    }
    
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
        logger.info(`Created new Paddle product: ${productId}`);
      } else {
        // Update existing Paddle product
        product = await paddle.products.update(productId, {
          name: plan.name,
          description: plan.description,
          taxCategory: "standard",
        });
        logger.info(`Updated existing Paddle product: ${productId}`);
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
        logger.info(`Created new Paddle price: ${priceId}`);
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
        logger.info(`Updated existing Paddle price: ${priceId}`);
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
    logger.error("Paddle sync failed for plan", { planId, error: err });
    throw err;
  }
}

// Helper to handle Paddle product activation/deactivation
async function handlePaddleProductStatus(planId: string, isActive: boolean, userId: string) {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { paddleConfig: true }
    });

    if (!plan) {
      logger.info(`Plan not found: ${planId}`);
      return;
    }

    // If no Paddle config exists, we need to create one first
    if (!plan.paddleConfig?.productId) {
      logger.info(`No Paddle configuration found for plan ${planId}, creating one...`);
      try {
        await syncPlanToPaddle(planId, userId);
        // Re-fetch the plan to get the updated Paddle config
        const updatedPlan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId },
          include: { paddleConfig: true }
        });
        if (!updatedPlan?.paddleConfig?.productId) {
          logger.info(`Failed to create Paddle configuration for plan ${planId}`);
          return;
        }
        // Update the plan reference
        plan.paddleConfig = updatedPlan.paddleConfig;
      } catch (syncError) {
        logger.error("Failed to create Paddle configuration", syncError);
        return;
      }
    }

    // Now we have a Paddle product, update its status
    const statusIndicator = isActive ? "active" : "archived";
    
    try {
      if (isActive) {
        // For activation: Update the product description to show it's active
        await paddle.products.update(plan.paddleConfig.productId, {
          status: statusIndicator,
        });
        logger.info(`Activated Paddle product ${plan.paddleConfig.productId}`);
      } else {
        try {
          await paddle.products.update(plan.paddleConfig.productId, {
            status: statusIndicator,
          });
          
          await paddle.products.archive(plan.paddleConfig.productId);
          logger.info(`Archived Paddle product ${plan.paddleConfig.productId}`);
          
        } catch (updateError: any) {
          logger.error("Failed to update Paddle product for deactivation", updateError);
          throw updateError;
        }
      }
      
      logger.info(`Updated Paddle product ${plan.paddleConfig.productId} status to ${statusIndicator}`);
      
      // Log the status change
      await prisma.log.create({
        data: {
          userId: userId,
          level: "info",
          message: `Paddle product status updated for plan ${plan.name}`,
          meta: {
            planId: plan.id,
            productId: plan.paddleConfig.productId,
            status: statusIndicator,
            action: isActive ? "activated" : "deactivated",
            method: isActive ? "description_update" : "description_update_and_archive"
          },
        },
      });
    } catch (err: any) {
      logger.error("Failed to update Paddle product status", err);
      // Log the error but don't fail the request
      await prisma.log.create({
        data: {
          userId: userId,
          level: "error",
          message: `Failed to update Paddle product status for plan ${plan.name}`,
          meta: {
            error: err?.message || err,
            planId: plan.id,
            productId: plan.paddleConfig.productId,
            intendedStatus: statusIndicator,
            method: isActive ? "description_update" : "description_update_and_archive"
          },
        },
      });
    }
  } catch (err) {
    logger.error("Error handling Paddle product status", err);
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });
  if (!user || user.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const { name, description, price, currency, features, isActive, idealFor, keyLimits, maxDocs, maxStorageMB, maxQueriesPerDay } = body;

  try {
    // Get the current plan to check if isActive is changing
    const currentPlan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { paddleConfig: true }
    });

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
    
    // Check if the active status changed
    const isActiveChanged = currentPlan && currentPlan.isActive !== isActive;
    
    // Auto-sync to Paddle
    try {
      await syncPlanToPaddle(plan.id, user.id);
    } catch (syncError) {
      logger.error("Paddle sync failed", syncError);
      // Don't fail the entire request if Paddle sync fails
      // The plan update was successful, just the sync failed
    }

    // Handle Paddle product activation/deactivation if status changed
    if (isActiveChanged) {
      try {
        await handlePaddleProductStatus(plan.id, isActive, user.id);
      } catch (statusError) {
        logger.error("Paddle status update failed", statusError);
        // Don't fail the request if status update fails
      }
    }
    
    return NextResponse.json(plan);
  } catch (error) {
    logger.error("Error updating subscription plan", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });
  if (!user || user.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });

  try {
    // Check if plan exists and get its Paddle config
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { paddleConfig: true }
    });

    if (!plan) {
      return new NextResponse("Plan not found", { status: 404 });
    }

    // Set the plan as inactive instead of deleting it
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false }
    });

    // Handle Paddle product deactivation
    try {
      await handlePaddleProductStatus(id, false, user.id);
    } catch (paddleError) {
      logger.error("Error handling Paddle deactivation", paddleError);
      // Don't fail the request if Paddle deactivation fails
    }
    
    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    logger.error("Error deactivating subscription plan", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
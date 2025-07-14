import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

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
          console.log(`Found existing Paddle product with name "${plan.name}": ${productId}`);
        }
      } catch (err) {
        console.log("Could not search for existing products:", err);
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
        console.log(`Created new Paddle product: ${productId}`);
      } else {
        // Update existing Paddle product
        product = await paddle.products.update(productId, {
          name: plan.name,
          description: plan.description,
          taxCategory: "standard",
        });
        console.log(`Updated existing Paddle product: ${productId}`);
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
        console.log(`Created new Paddle price: ${priceId}`);
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
        console.log(`Updated existing Paddle price: ${priceId}`);
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

// Helper to handle Paddle product activation/deactivation
async function handlePaddleProductStatus(planId: string, isActive: boolean, userId: string) {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { paddleConfig: true }
    });

    if (!plan) {
      console.log(`Plan not found: ${planId}`);
      return;
    }

    // If no Paddle config exists, we need to create one first
    if (!plan.paddleConfig?.productId) {
      console.log(`No Paddle configuration found for plan ${planId}, creating one...`);
      try {
        await syncPlanToPaddle(planId, userId);
        // Re-fetch the plan to get the updated Paddle config
        const updatedPlan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId },
          include: { paddleConfig: true }
        });
        if (!updatedPlan?.paddleConfig?.productId) {
          console.log(`Failed to create Paddle configuration for plan ${planId}`);
          return;
        }
        // Update the plan reference
        plan.paddleConfig = updatedPlan.paddleConfig;
      } catch (syncError) {
        console.error("Failed to create Paddle configuration:", syncError);
        return;
      }
    }

    // Now we have a Paddle product, update its status
    const statusIndicator = isActive ? "ACTIVE" : "INACTIVE";
    
    // Remove any existing status indicators from the description
    const cleanDescription = plan.description.replace(/\s*\[(ACTIVE|INACTIVE)\]\s*$/, '');
    const updatedDescription = `${cleanDescription} [${statusIndicator}]`;
    
    try {
      if (isActive) {
        // For activation: Update the product description to show it's active
        await paddle.products.update(plan.paddleConfig.productId, {
          description: updatedDescription,
        });
        console.log(`Activated Paddle product ${plan.paddleConfig.productId}`);
      } else {
        // For deactivation: We need to make the product unavailable for new subscriptions
        // Paddle doesn't have a direct "inactive" status, so we'll:
        // 1. Update the description to show it's inactive
        // 2. Try to archive the product (if supported) or use a different approach
        
        try {
          // First, try to update the description
          await paddle.products.update(plan.paddleConfig.productId, {
            description: updatedDescription,
          });
          
          // Then, try to archive the product (this is the proper way to deactivate in Paddle)
          // Note: This might not be available in all Paddle SDK versions
          try {
            await paddle.products.archive(plan.paddleConfig.productId);
            console.log(`Archived Paddle product ${plan.paddleConfig.productId}`);
          } catch (archiveError: any) {
            console.log(`Archive method not available, using description update only: ${archiveError.message}`);
            // If archive is not available, we'll rely on the description update
          }
          
        } catch (updateError: any) {
          console.error("Failed to update Paddle product for deactivation:", updateError);
          throw updateError;
        }
      }
      
      console.log(`Updated Paddle product ${plan.paddleConfig.productId} status to ${statusIndicator}`);
      
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
            oldDescription: plan.description,
            newDescription: updatedDescription,
            method: isActive ? "description_update" : "description_update_and_archive"
          },
        },
      });
    } catch (err: any) {
      console.error("Failed to update Paddle product status:", err);
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
            intendedDescription: updatedDescription,
            method: isActive ? "description_update" : "description_update_and_archive"
          },
        },
      });
    }
  } catch (err) {
    console.error("Error handling Paddle product status:", err);
  }
}

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async () => {
  try {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
      where: { email: session!.user?.email! },
    });
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
});

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
      where: { email: session!.user?.email! },
    });
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
      await syncPlanToPaddle(plan.id, user!.id);
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
});

export const PATCH = RequireRoles([UserRole.SUPER_ADMIN])(async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
      where: { email: session!.user?.email! },
    });
    const body = await req.json();
    const { id, name, description, price, currency, features, isActive, idealFor, keyLimits, maxDocs, maxStorageMB, maxQueriesPerDay } = body;
    if (!id) return NextResponse.json({ error: "Missing plan id" }, { status: 400 });
    
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
      await syncPlanToPaddle(plan.id, user!.id);
    } catch (syncError) {
      console.error("Paddle sync failed:", syncError);
      // Don't fail the entire request if Paddle sync fails
      // The plan update was successful, just the sync failed
    }

    // Handle Paddle product activation/deactivation if status changed
    if (isActiveChanged) {
      try {
        await handlePaddleProductStatus(plan.id, isActive, user!.id);
      } catch (statusError) {
        console.error("Paddle status update failed:", statusError);
        // Don't fail the request if status update fails
      }
    }
    
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
});

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN])(async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({
      where: { email: session!.user?.email! },
    });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing plan id" }, { status: 400 });
    
    // Get the plan details before updating
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { paddleConfig: true }
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Set the plan as inactive instead of deleting it
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false }
    });

    // Handle Paddle product deactivation
    try {
      await handlePaddleProductStatus(id, false, user!.id);
    } catch (paddleError) {
      console.error("Error handling Paddle deactivation:", paddleError);
      // Don't fail the request if Paddle deactivation fails
    }
    
    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error("Error deactivating subscription plan:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
});

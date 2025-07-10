import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";
import axios from "axios";

// Fallback function to manually fetch products from Paddle API
async function fetchProductsManually(): Promise<any[]> {
  try {
    const response = await axios.get('https://api.paddle.com/products', {
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.log('Manual product fetch failed:', error?.message);
    return [];
  }
}

// Fallback function to manually fetch prices from Paddle API
async function fetchPricesManually(productId: string): Promise<any[]> {
  try {
    const response = await axios.get(`https://api.paddle.com/prices?product_id=${productId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    if (response.status === 200 && response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.log('Manual price fetch failed:', error?.message);
    return [];
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  });
  if (!user || user.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Get all subscription plans from database
    const plans = await prisma.subscriptionPlan.findMany({
      include: {
        paddleConfig: true,
      },
    });

    const results = [];

    for (const plan of plans) {
      console.log(`Processing plan: ${plan.name}`);
      
      try {
        // Step 1: Search for product by name in Paddle using SDK
        console.log(`Searching for product with name: "${plan.name}"`);
        
        let matchingProduct = null;
        let matchingPrice = null;
        
        try {
          // Use SDK to list products
          const productsResponse = await paddle.products.list();
          const products = [];
          for await (const product of productsResponse) {
            products.push(product);
          }
          
          console.log(`Found ${products.length} products in Paddle`);
          
          matchingProduct = products.find((p: any) => p.name === plan.name);
          
          if (matchingProduct) {
            console.log(`Found product in Paddle: ${matchingProduct.id} for plan: ${plan.name}`);
            
            // Step 2: Search for price by description in the product
            try {
              const pricesResponse = await paddle.prices.list({
                productId: [matchingProduct.id],
              });
              const prices = [];
              for await (const price of pricesResponse) {
                prices.push(price);
              }
              
              console.log(`Found ${prices.length} prices for product ${matchingProduct.id}`);
              
              matchingPrice = prices.find((p: any) => 
                p.description === plan.description || 
                p.description === plan.name ||
                p.name === plan.name
              );
              
              if (matchingPrice) {
                console.log(`Found price in Paddle: ${matchingPrice.id} for product: ${matchingProduct.id}`);
              } else {
                console.log(`No price found in Paddle for product: ${matchingProduct.id}`);
              }
            } catch (priceError: any) {
              console.log(`Error fetching prices for product ${matchingProduct.id}:`, priceError?.message);
              // Continue with just the product
            }
          } else {
            console.log(`No product found in Paddle for plan: ${plan.name}`);
          }
        } catch (productError: any) {
          console.log(`Error fetching products with SDK:`, productError?.message);
          
          // Try manual API call as fallback
          console.log(`Trying manual API call as fallback...`);
          const products = await fetchProductsManually();
          
          if (products.length > 0) {
            console.log(`Found ${products.length} products via manual API call`);
            matchingProduct = products.find((p: any) => p.name === plan.name);
            
            if (matchingProduct) {
              console.log(`Found product via manual API: ${matchingProduct.id} for plan: ${plan.name}`);
              
              // Try to fetch prices manually
              const prices = await fetchPricesManually(matchingProduct.id);
              if (prices.length > 0) {
                matchingPrice = prices.find((p: any) => 
                  p.description === plan.description || 
                  p.description === plan.name ||
                  p.name === plan.name
                );
                
                if (matchingPrice) {
                  console.log(`Found price via manual API: ${matchingPrice.id} for product: ${matchingProduct.id}`);
                }
              }
            }
          }
          
          // If still no product found, try to create a new one
          if (!matchingProduct) {
            console.log(`Creating new product for plan: ${plan.name}`);
            try {
              matchingProduct = await paddle.products.create({
                name: plan.name,
                description: plan.description,
                taxCategory: "standard",
              });
              console.log(`Created new product: ${matchingProduct.id}`);
            } catch (createError: any) {
              console.log(`Failed to create product:`, createError?.message);
            }
          }
        }

        // Step 3: Update or create PaddleConfig in database
        if (matchingProduct) {
          await prisma.paddleConfig.upsert({
            where: { subscriptionPlanId: plan.id },
            update: {
              productId: matchingProduct.id,
              priceId: matchingPrice?.id || "",
            },
            create: {
              subscriptionPlanId: plan.id,
              productId: matchingProduct.id,
              priceId: matchingPrice?.id || "",
              trialDays: 7,
              billingCycle: "monthly",
            },
          });

          console.log(`Successfully synced Paddle IDs for plan: ${plan.name}`);
          results.push({
            planName: plan.name,
            productId: matchingProduct.id,
            priceId: matchingPrice?.id || "",
            status: matchingPrice ? 'success' : 'partial',
            message: matchingPrice ? 'Successfully synced Paddle IDs' : 'Product synced but no matching price found',
          });
        } else {
          results.push({
            planName: plan.name,
            status: 'not_found',
            message: 'No matching product found in Paddle and could not create new one',
          });
        }

      } catch (error: any) {
        console.error(`Error processing plan ${plan.name}:`, error?.message || error);
        results.push({
          planName: plan.name,
          status: 'error',
          message: error?.message || 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const partialCount = results.filter(r => r.status === 'partial').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const notFoundCount = results.filter(r => r.status === 'not_found').length;

    return NextResponse.json({
      message: `Sync completed. Success: ${successCount}, Partial: ${partialCount}, Errors: ${errorCount}, Not Found: ${notFoundCount}`,
      results,
    });

  } catch (error: any) {
    console.error('Error in sync-paddle-ids:', error);
    
    await prisma.log.create({
      data: {
        userId: user.id,
        level: "error",
        message: "Paddle IDs sync failed",
        meta: {
          error: error?.message || error,
        },
      },
    });

    return NextResponse.json(
      { error: `Sync failed: ${error?.message || error}` },
      { status: 500 }
    );
  }
} 
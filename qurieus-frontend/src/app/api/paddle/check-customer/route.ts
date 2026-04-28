import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";
import { logger } from "@/lib/logger";
import { buildPaddleCustomData } from "@/lib/paddleProduct";

export async function POST(req: Request) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = session.user.id;
    const { priceId, checkoutAttemptId } = await req.json();
    
    logger.info("Paddle Check Customer API: Checking customer status", { 
      userId, 
      priceId,
      checkoutAttemptId: checkoutAttemptId || null,
      nodeEnv: process.env.NODE_ENV,
      hasPaddleApiKey: !!process.env.PADDLE_API_KEY,
    });

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Get user's current subscription
    const userSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let customerId = null;
    let hasPaymentMethod = false;

    // Try to create/get customer from Paddle
    try {
      
      const newCustomer = await paddle.customers.create({
        email: session.user.email || '',
        name: session.user.name || session.user.email || 'Customer',
        customData: buildPaddleCustomData({
          application_customer_id: session.user.id,
          application_customer_email: session.user.email,
          tenantId: session.user.id,
          practiceId: session.user.id,
          orderId: `customer_create_${session.user.id}_${Date.now()}`,
          plan: "unknown",
        }),
      });
      
      customerId = newCustomer.id;
      hasPaymentMethod = true;
      
      logger.info("Paddle Check Customer API: New customer created successfully", { 
        userId, 
        customerId 
      });
      
      // Update our database with the new customer ID
      if (userSubscription) {
        await prisma.userSubscription.update({
          where: { id: userSubscription.id },
          data: { paddleCustomerId: customerId }
        });
      }
      
    } catch (error: any) {
      // If creation fails, extract existing customer ID from error
      if (error.message?.includes('conflicts with customer of id')) {
        const match = error.message.match(/customer of id ([a-zA-Z0-9_]+)/);
        if (match && match[1]) {
          customerId = match[1];
          hasPaymentMethod = true;
          
          logger.info("Paddle Check Customer API: Existing customer found", { 
            userId, 
            customerId,
            checkoutAttemptId: checkoutAttemptId || null,
          });
          
          // Update our database with the existing customer ID
          if (userSubscription) {
            await prisma.userSubscription.update({
              where: { id: userSubscription.id },
              data: { paddleCustomerId: customerId }
            });
          }
        }
      } else {
        logger.error("Paddle Check Customer API: Error creating customer", { 
          userId, 
          checkoutAttemptId: checkoutAttemptId || null,
          error: error.message 
        });
      }
    }

    const responseTime = Date.now() - startTime;
    logger.info("Paddle Check Customer API: Customer check completed", { 
      userId, 
      customerId,
      hasPaymentMethod,
      hasExistingSubscription: !!(userSubscription?.paddleSubscriptionId && !userSubscription.paddleSubscriptionId.startsWith('trial_')),
      responseTime,
      checkoutAttemptId: checkoutAttemptId || null,
    });

    return NextResponse.json({
      hasPaymentMethod,
      customerId,
      hasExistingSubscription: !!(userSubscription?.paddleSubscriptionId && !userSubscription.paddleSubscriptionId.startsWith('trial_'))
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Paddle Check Customer API: Error checking customer", { 
      userId, 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Failed to check customer status" },
      { status: 500 }
    );
  }
} 
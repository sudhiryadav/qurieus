import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();
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
        name: session.user.name || session.user.email || 'Customer'
      });
      
      customerId = newCustomer.id;
      hasPaymentMethod = true;
      
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
          
          // Update our database with the existing customer ID
          if (userSubscription) {
            await prisma.userSubscription.update({
              where: { id: userSubscription.id },
              data: { paddleCustomerId: customerId }
            });
          }
        }
      }
    }

    return NextResponse.json({
      hasPaymentMethod,
      customerId,
      hasExistingSubscription: !!(userSubscription?.paddleSubscriptionId && !userSubscription.paddleSubscriptionId.startsWith('trial_'))
    });

  } catch (error) {
    console.error("Error checking customer:", error);
    return NextResponse.json(
      { error: "Failed to check customer status" },
      { status: 500 }
    );
  }
} 
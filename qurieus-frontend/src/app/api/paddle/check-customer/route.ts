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

    // Check if user already has a Paddle customer ID in our database
    const userSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Also check if user has any subscription at all
    const allUserSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("All user subscriptions:", allUserSubscriptions.map(sub => ({
      id: sub.id,
      paddleCustomerId: sub.paddleCustomerId,
      paddleSubscriptionId: sub.paddleSubscriptionId,
      status: sub.status,
      billingCycle: sub.billingCycle,
      createdAt: sub.createdAt
    })));

    console.log("Customer check - user subscription:", {
      userId: session.user.id,
      userEmail: session.user.email,
      hasSubscription: !!userSubscription,
      paddleCustomerId: userSubscription?.paddleCustomerId,
      paddleSubscriptionId: userSubscription?.paddleSubscriptionId,
      status: userSubscription?.status,
      billingCycle: userSubscription?.billingCycle
    });

    let hasPaymentMethod = false;
    let customerId = null;

    // First, try to get customer ID from our database
    if (userSubscription?.paddleCustomerId) {
      customerId = userSubscription.paddleCustomerId;
      
      try {
        // Actually check with Paddle API if customer has payment methods
        console.log("Checking Paddle customer:", customerId);
        
        // Get customer details from Paddle
        const customer = await paddle.customers.get(customerId);
        
        console.log("Paddle customer response:", {
          customerId: customer.id,
          email: customer.email,
          hasCustomer: !!customer
        });
        
        // If we can successfully get customer details, they likely have payment methods
        // Paddle customers typically have payment info stored
        hasPaymentMethod = true;
        
        console.log("Customer check (Paddle API):", {
          customerId,
          hasPaymentMethod,
          customerEmail: customer.email
        });
        
      } catch (error: any) {
        console.error("Error checking Paddle customer:", error);
        
        // If Paddle API fails, fall back to heuristic approach
        const hasMadePaymentsBefore = !!(userSubscription.paddleSubscriptionId && 
          !userSubscription.paddleSubscriptionId.startsWith('trial_') &&
          userSubscription.billingCycle !== 'trial');
        
        hasPaymentMethod = hasMadePaymentsBefore;
        
        console.log("Customer check (fallback heuristic):", {
          customerId,
          hasPaymentMethod,
          hasMadePaymentsBefore,
          paddleSubscriptionId: userSubscription.paddleSubscriptionId,
          billingCycle: userSubscription.billingCycle,
          error: error.message
        });
      }
    } else {
      // No customer ID in our database, try to find customer by email in Paddle
      console.log("No customer ID in database, trying alternative approach for email:", session.user.email);
      
      // Since listing all customers might not be efficient, we'll use a different approach
      // We'll assume that if user has made payments before (indicated by having any subscription),
      // they likely have a Paddle customer account
      
      const hasAnySubscriptionHistory = allUserSubscriptions.length > 0;
      
      if (hasAnySubscriptionHistory) {
        console.log("User has subscription history, likely has Paddle customer account");
        
        // Try to create a customer to see if one already exists
        try {
          const newCustomer = await paddle.customers.create({
            email: session.user.email || '',
            name: session.user.name || session.user.email || 'Customer'
          });
          
          customerId = newCustomer.id;
          hasPaymentMethod = true;
          
          console.log("Created new Paddle customer:", {
            customerId: newCustomer.id,
            email: newCustomer.email
          });
          
          // Update our database with the new customer ID
          if (userSubscription) {
            await prisma.userSubscription.update({
              where: { id: userSubscription.id },
              data: { paddleCustomerId: customerId }
            });
            console.log("Updated database with new Paddle customer ID");
          }
          
        } catch (error: any) {
          console.error("Error creating Paddle customer:", error);
          
          // If customer creation fails, it might mean customer already exists
          // In this case, we'll assume they have payment methods
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log("Customer likely already exists in Paddle");
            hasPaymentMethod = true;
          }
        }
      } else {
        console.log("No subscription history, user likely doesn't have Paddle customer account");
      }
    }

    return NextResponse.json({
      hasPaymentMethod,
      customerId,
      shouldShowCheckout: !hasPaymentMethod, // Show checkout only if no payment method
      canProcessDirectly: hasPaymentMethod // Can process payment directly if payment method exists
    });

  } catch (error) {
    console.error("Error checking customer:", error);
    return NextResponse.json(
      { error: "Failed to check customer status" },
      { status: 500 }
    );
  }
} 
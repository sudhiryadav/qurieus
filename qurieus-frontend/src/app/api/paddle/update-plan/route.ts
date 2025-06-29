import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId, priceId } = await req.json();
    if (!subscriptionId || !priceId) {
      return NextResponse.json(
        { error: "Subscription ID and Price ID are required" },
        { status: 400 }
      );
    }

    // Verify the subscription belongs to the current user
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        paddleSubscriptionId: subscriptionId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Update the subscription in our database to set that status as in progress    
    await prisma.userSubscription.update({
      where: {
        id: subscription.id
      },
      data: {
        status: "in_progress"
      }
    });

    // Call Paddle API to update the subscription
    const endpoint = process.env.NODE_ENV === "production" 
      ? `https://api.paddle.com/subscriptions/${subscriptionId}`
      : `https://sandbox-api.paddle.com/subscriptions/${subscriptionId}`;

    const response = await axios.patch(
      endpoint,
      {
        proration_billing_mode: "prorated_immediately",
        items: [
          {
            price_id: priceId,
            quantity: 1
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({ 
      success: true, 
      subscription: response.data.data 
    });
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to update subscription" },
      { status: error.response?.status || 500 }
    );
  }
} 
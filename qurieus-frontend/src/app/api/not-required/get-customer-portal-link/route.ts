import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import axios from "axios";
import { Paddle } from "@paddle/paddle-node-sdk";

const paddle = new Paddle(process.env.PADDLE_API_KEY || '');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paddleCustomerId } = await req.json();
    if (!paddleCustomerId) {
      return NextResponse.json(
        { error: "Paddle Customer ID is required" },
        { status: 400 }
      );
    }

    // Verify the customer ID belongs to the current user
    const subscription = await prisma.subscription.findFirst({
      where: {
        paddleCustomerId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Get the portal URL from Paddle
    const endpoint = process.env.NODE_ENV === "production" ? `https://api.paddle.com/customers/${paddleCustomerId}/portal-sessions` : `https://sandbox-api.paddle.com/customers/${paddleCustomerId}/portal-sessions`;
    const requestBody = {};
    const axiosConfig = {
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
      },
    };
    const response = await axios.post(
     endpoint,
     requestBody,
     axiosConfig
    );

    return NextResponse.json({ portalUrl: response.data?.data?.urls?.general?.overview });
  } catch (error) {
    console.error("Error getting customer portal URL:", error);
    return NextResponse.json(
      { error: "Failed to get customer portal URL" },
      { status: 500 }
    );
  }
} 
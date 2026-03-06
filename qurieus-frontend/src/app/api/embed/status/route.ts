import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

/**
 * Public API: returns whether the embed user (apiKey = userId) has an active subscription.
 * Used by the chat widget to hide the bubble when subscription is expired.
 */
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("apiKey");
    if (!apiKey) {
      return NextResponse.json({ hasActiveSubscription: false });
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: apiKey,
        status: "active",
      },
      select: { id: true },
    });

    return NextResponse.json({
      hasActiveSubscription: !!subscription,
    });
  } catch (error) {
    console.error("[embed/status] Error checking subscription:", error);
    return NextResponse.json({ hasActiveSubscription: false });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { UserRole } from "@prisma/client";

/**
 * Public API: returns whether the embed user (apiKey = userId) has an active subscription.
 * Admin/Super Admin users always have access (unlimited) - they run the app, no subscription needed.
 */
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("apiKey");
    if (!apiKey) {
      return NextResponse.json({ hasActiveSubscription: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: apiKey },
      select: { role: true },
    });

    if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json({ hasActiveSubscription: true });
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

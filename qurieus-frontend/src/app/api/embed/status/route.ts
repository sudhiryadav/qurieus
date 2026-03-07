import { NextRequest } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { UserRole } from "@prisma/client";
import { corsResponse, createOptionsHandler } from "@/utils/cors";

// Handle OPTIONS preflight for CORS (required when embed widget calls from external domains)
export const OPTIONS = createOptionsHandler();

/**
 * Public API: returns whether the embed user (apiKey = userId) has an active subscription.
 * Admin/Super Admin users always have access (unlimited) - they run the app, no subscription needed.
 * CORS-enabled for embed widget on customer sites (e.g. smartweb.in).
 */
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.nextUrl.searchParams.get("apiKey");
    if (!apiKey) {
      return corsResponse({ hasActiveSubscription: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: apiKey },
      select: { role: true },
    });

    if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) {
      return corsResponse({ hasActiveSubscription: true });
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: apiKey,
        status: "active",
      },
      select: { id: true },
    });

    return corsResponse({
      hasActiveSubscription: !!subscription,
    });
  } catch (error) {
    console.error("[embed/status] Error checking subscription:", error);
    return corsResponse({ hasActiveSubscription: false });
  }
}

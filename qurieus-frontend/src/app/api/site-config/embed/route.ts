import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { UserRole } from "@prisma/client";

const EMBED_USER_ID_KEY = "embed_user_id";

/**
 * Public API: returns the embed user id for the site footer widget.
 * Only returns embedUserId when the user has an active subscription (hides chat bubble when expired).
 * 1. Use embed_user_id from SiteConfig if set by super admin.
 * 2. Otherwise fall back to the first SUPER_ADMIN user so the footer always shows site content.
 */
export async function GET() {
  let embedUserId: string | null = null;

  // Try SiteConfig first (may fail if migration not applied)
  try {
    const row = await prisma.siteConfig.findUnique({
      where: { key: EMBED_USER_ID_KEY },
    });
    if (row?.value) {
      embedUserId = row.value;
    }
  } catch (siteConfigError) {
    console.warn("SiteConfig read failed (table may be missing), using fallback:", siteConfigError);
  }

  // Fallback: use super admin's account so footer always shows this website's documents
  if (!embedUserId) {
    try {
      const superAdmin = await prisma.user.findFirst({
        where: { role: UserRole.SUPER_ADMIN, is_active: true },
        select: { id: true },
      });
      embedUserId = superAdmin?.id ?? null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error fetching site config embed:", error);
      return NextResponse.json(
        { error: "Failed to fetch site config", details: message },
        { status: 500 }
      );
    }
  }

  // Admin/Super Admin always get the widget - they run the app, no subscription needed
  if (embedUserId) {
    const embedUser = await prisma.user.findUnique({
      where: { id: embedUserId },
      select: { role: true },
    });
    const isAdmin = embedUser?.role === UserRole.ADMIN || embedUser?.role === UserRole.SUPER_ADMIN;
    if (!isAdmin) {
      const hasActiveSubscription = await prisma.userSubscription.findFirst({
        where: { userId: embedUserId, status: "active" },
        select: { id: true },
      });
      if (!hasActiveSubscription) {
        embedUserId = null;
      }
    }
  }

  return NextResponse.json({ embedUserId });
}

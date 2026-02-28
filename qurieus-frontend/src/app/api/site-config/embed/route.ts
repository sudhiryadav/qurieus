import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { UserRole } from "@prisma/client";

const EMBED_USER_ID_KEY = "embed_user_id";

/**
 * Public API: returns the embed user id for the site footer widget.
 * The footer always shows documents uploaded by the super admin (this website's content).
 * 1. Use embed_user_id from SiteConfig if set by super admin.
 * 2. Otherwise fall back to the first SUPER_ADMIN user so the footer always shows site content.
 */
export async function GET() {
  // Try SiteConfig first (may fail if migration not applied)
  try {
    const row = await prisma.siteConfig.findUnique({
      where: { key: EMBED_USER_ID_KEY },
    });
    if (row?.value) {
      return NextResponse.json({ embedUserId: row.value });
    }
  } catch (siteConfigError) {
    console.warn("SiteConfig read failed (table may be missing), using fallback:", siteConfigError);
  }

  // Fallback: use super admin's account so footer always shows this website's documents
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { role: UserRole.SUPER_ADMIN, is_active: true },
      select: { id: true },
    });
    return NextResponse.json({
      embedUserId: superAdmin?.id ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error fetching site config embed:", error);
    return NextResponse.json(
      { error: "Failed to fetch site config", details: message },
      { status: 500 }
    );
  }
}

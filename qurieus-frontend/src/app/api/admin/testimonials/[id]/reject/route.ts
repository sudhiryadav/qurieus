import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

/**
 * POST /api/admin/testimonials/[id]/reject
 * Reject a testimonial (sets isApproved to false, or optionally delete).
 */
export const POST = RequireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN])(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    await prisma.testimonial.update({
      where: { id },
      data: { isApproved: false },
    });
    return NextResponse.json({ success: true });
  }
);

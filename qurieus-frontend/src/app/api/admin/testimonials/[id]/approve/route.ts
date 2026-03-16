import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

/**
 * POST /api/admin/testimonials/[id]/approve
 * Approve a testimonial so it appears on the public testimonials section.
 */
export const POST = RequireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN])(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { isApproved: true, status: "APPROVED" },
    });
    return NextResponse.json({ success: true, testimonial });
  }
);

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/testimonials/user/[userId]
 * Returns all testimonials for a specific user (feedback history).
 */
export const GET = RequireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN])(
  async (_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params;

    const testimonials = await prisma.testimonial.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      testimonials: testimonials.map((t) => ({
        id: t.id,
        content: t.content,
        designation: t.designation,
        star: t.star,
        status: t.status,
        isApproved: t.isApproved,
        rejectionReason: t.rejectionReason,
        rejectedAt: t.rejectedAt,
        createdAt: t.createdAt,
      })),
    });
  }
);

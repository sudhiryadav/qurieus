import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/testimonials
 * List all testimonials (for admin review).
 */
export const GET = RequireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN])(
  async () => {
    const testimonials = await prisma.testimonial.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, jobTitle: true, company: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ testimonials });
  }
);

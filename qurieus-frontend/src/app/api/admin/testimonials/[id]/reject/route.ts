import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { sendTestimonialRejectedEmail } from "@/lib/email";

/**
 * POST /api/admin/testimonials/[id]/reject
 * Reject a testimonial with optional admin comment. Sends email notification to user.
 */
export const POST = RequireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN])(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const body = await req.json().catch(() => ({}));
    const rejectionReason = typeof body.rejectionReason === "string" ? body.rejectionReason.trim() : null;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    await prisma.testimonial.update({
      where: { id },
      data: {
        isApproved: false,
        status: "REJECTED",
        rejectionReason: rejectionReason || null,
        rejectedAt: new Date(),
        rejectedById: session?.user?.id || null,
      },
    });

    // Send rejection email to user
    try {
      await sendTestimonialRejectedEmail({
        email: testimonial.user.email,
        name: testimonial.user.name,
        rejectionReason: rejectionReason || undefined,
      });
    } catch (emailErr) {
      // Don't fail the request - rejection was successful
    }

    return NextResponse.json({ success: true });
  }
);

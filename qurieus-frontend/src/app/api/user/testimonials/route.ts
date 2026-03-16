import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

/**
 * GET /api/user/testimonials
 * Returns the authenticated user's testimonial history (all statuses).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { userId: session.user.id },
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
  } catch (error: unknown) {
    console.error("User testimonials fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch your feedback history" },
      { status: 500 }
    );
  }
}

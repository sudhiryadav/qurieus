import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

/**
 * GET /api/testimonials
 * Public - returns approved testimonials with user info (name, image) for display.
 * Only the latest approved testimonial per user is shown.
 */
export async function GET() {
  try {
    const allApproved = await prisma.testimonial.findMany({
      where: { status: "APPROVED" },
      include: {
        user: {
          select: { id: true, name: true, image: true, jobTitle: true, company: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Keep only the latest approved testimonial per user
    const seenUserIds = new Set<string>();
    const testimonials = allApproved.filter((t) => {
      if (seenUserIds.has(t.userId)) return false;
      seenUserIds.add(t.userId);
      return true;
    }).slice(0, 12);

    const data = testimonials.map((t) => ({
      id: t.id,
      content: t.content,
      designation: t.designation || [t.user.jobTitle, t.user.company].filter(Boolean).join(" @ ") || undefined,
      star: t.star,
      userId: t.user.id,
      name: t.user.name,
      image: t.user.image,
    }));

    return NextResponse.json({ testimonials: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/testimonials
 * Authenticated - user submits a testimonial (pending approval).
 * Only one pending testimonial per user at a time.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Block if user already has a pending testimonial
    const existingPending = await prisma.testimonial.findFirst({
      where: { userId: session.user.id, status: "PENDING" },
    });
    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a testimonial pending review. Please wait for admin to review it before submitting again." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { content, designation, star = 5 } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
        designation: designation?.trim() || null,
        star: Math.min(5, Math.max(1, Number(star) || 5)),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      testimonial: { id: testimonial.id, content: testimonial.content },
      message: "Thank you! Your testimonial has been submitted for review.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}

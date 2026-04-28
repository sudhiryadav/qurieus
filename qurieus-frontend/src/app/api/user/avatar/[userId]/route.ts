import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import s3Service from "@/lib/s3";

/**
 * GET /api/user/avatar/[userId]
 * Serves user avatar image. Public - used for avatars in header, testimonials, etc.
 * If user has OAuth image URL, redirects to it. If S3 key, streams from S3.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) {
      return new NextResponse(null, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (!user?.image) {
      return new NextResponse(null, { status: 404 });
    }

    // OAuth providers store full URL
    if (user.image.startsWith("http")) {
      return NextResponse.redirect(user.image);
    }

    // S3 key - fetch and stream
    const buffer = await s3Service.getObjectAsBuffer(user.image);
    const contentType =
      user.image.endsWith(".png")
        ? "image/png"
        : user.image.endsWith(".webp")
          ? "image/webp"
          : "image/jpeg";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // 24h cache
      },
    });
  } catch (error: any) {
    const isNotFound =
      error?.name === "NoSuchKey" ||
      error?.Code === "NoSuchKey" ||
      error?.message?.includes("does not exist");
    return new NextResponse(null, { status: isNotFound ? 404 : 500 });
  }
}

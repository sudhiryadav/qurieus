import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { authOptions } from "@/utils/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(null);
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
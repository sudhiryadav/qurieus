import prisma from "@/lib/prisma";
import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all the subscriptions from the database
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true,
        plan: true,
      },
    });

    return NextResponse.json(subscriptions);
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch subscriptions" },
      { status: error.response?.status || 500 }
    );
  }
}
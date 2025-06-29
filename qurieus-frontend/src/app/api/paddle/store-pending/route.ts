import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { transactionId } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }
    // Store the pending transaction
    await prisma.pendingSubscription.upsert({
      where: { transactionId },
      create: {
        transactionId,
        userId: session.user.id,
      },
      update: {},
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error storing pending subscription:", error);
    return NextResponse.json({ error: error.message || "Failed to store pending subscription" }, { status: 500 });
  }
} 
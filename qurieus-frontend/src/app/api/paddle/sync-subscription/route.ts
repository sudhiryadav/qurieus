import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { fetchPaddleSubscription, upsertUserSubscriptionFromPaddle } from "@/lib/paddle";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }
    // Fetch from Paddle and upsert
    const paddleSub = await fetchPaddleSubscription(subscriptionId);
    const result = await upsertUserSubscriptionFromPaddle(paddleSub, session.user.id);
    return NextResponse.json({ success: true, subscription: result });
  } catch (error: any) {
    console.error("Error syncing subscription:", error);
    return NextResponse.json({ error: error.message || "Failed to sync subscription" }, { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const { paddleSubscriptionId, paddleCustomerId, planId, status, currentPeriodStart, currentPeriodEnd } = data;

  if (!paddleSubscriptionId || !paddleCustomerId || !planId || !status || !currentPeriodStart || !currentPeriodEnd) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Cast data to 'any' to bypass TypeScript's strict type checking
  const subscriptionData = {
    userId: user.id,
    planId,
    paddleSubscriptionId,
    paddleCustomerId,
    status,
    currentPeriodStart: new Date(currentPeriodStart),
    currentPeriodEnd: new Date(currentPeriodEnd),
  } as any;

  const subscription = await prisma.subscription.create({
    data: subscriptionData,
  });

  return NextResponse.json({ subscription });
} 
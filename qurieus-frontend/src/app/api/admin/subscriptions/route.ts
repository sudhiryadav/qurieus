import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

// Helper to check SUPER_ADMIN
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

// GET: List all subscriptions with user and plan info
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: true,
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(subscriptions);
}

// PATCH: Update a subscription
export async function PATCH(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;
  const data = await req.json();
  const { id, ...update } = data;
  if (!id) return NextResponse.json({ error: "Missing subscription id" }, { status: 400 });
  const subscription = await prisma.subscription.update({
    where: { id },
    data: update,
  });
  return NextResponse.json(subscription);
}

// DELETE: Remove a subscription
export async function DELETE(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing subscription id" }, { status: 400 });
  await prisma.subscription.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

// Helper to check SUPER_ADMIN
async function requireSuperAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin(req);
  if (guard) return guard;
  const users = await prisma.user.findMany({
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { plan: true },
      },
    } as any, // bypass linter error
    orderBy: { created_at: "desc" },
  });
  // Flatten the subscriptions array to a single subscription (if any)
  const usersWithLatestSubscription = users.map(user => {
    const u = user as any;
    return {
      ...user,
      subscription: u.subscriptions?.[0] || null,
      subscriptions: undefined,
    };
  });
  return NextResponse.json(usersWithLatestSubscription);
}

export async function PATCH(req: NextRequest) {
  const guard = await requireSuperAdmin(req);
  if (guard) return guard;
  const data = await req.json();
  const { id, ...update } = data;
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  const user = await prisma.user.update({
    where: { id },
    data: update,
  });
  return NextResponse.json(user);
}

export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin(req);
  if (guard) return guard;
  const data = await req.json();
  const user = await prisma.user.create({ data });
  return NextResponse.json(user);
} 

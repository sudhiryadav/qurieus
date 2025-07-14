import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles, invalidateUserCache } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
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
});

export const PATCH = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  const data = await req.json();
  const { id, ...update } = data;
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  
  const user = await prisma.user.update({
    where: { id },
    data: update,
  });
  
  // Invalidate user cache after update
  await invalidateUserCache(id);
  
  return NextResponse.json(user);
});

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  const data = await req.json();
  const user = await prisma.user.create({ data });
  return NextResponse.json(user);
}); 

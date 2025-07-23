import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles, invalidateUserCache } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (request: Request) => {
  const session = await getServerSession(authOptions);
  // Only allow admin/superadmin
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    where: {
      role: { not: 'AGENT' },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      company: true,
      plan: true,
      subscription_type: true,
      subscription_start_date: true,
      subscription_end_date: true,
      is_verified: true,
      jobTitle: true,
      bio: true,
      phone: true,
      subscriptions: {
        select: {
          plan: {
            select: {
              name: true
            }
          }
        },
        where: {
          status: 'active'
        },
        take: 1
      }
    },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ users });
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

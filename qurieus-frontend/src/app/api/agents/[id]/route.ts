import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { hash } from "bcryptjs";
import { RequireRoles, invalidateUserCache } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

// PUT /api/agents/[id] - Update agent profile
export const PUT = RequireRoles([UserRole.USER, UserRole.ADMIN])(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  const { name, email } = await request.json();
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const { id } = await params;

  // Verify the agent belongs to the current user
  const agent = await prisma.user.findFirst({
    where: {
      id: id,
        parentUserId: session!.user!.id,
      role: "AGENT" as any,
    } as any,
  });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // Check if email is already taken by another user
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      id: { not: id },
    },
  });

  if (existingUser) {
    return NextResponse.json({ error: "Email is already taken" }, { status: 409 });
  }

  const updatedAgent = await prisma.user.update({
    where: { id: id },
    data: { name, email },
    select: {
      id: true,
      name: true,
      email: true,
      is_active: true,
      created_at: true,
    },
  });

  // Invalidate user cache after update
  await invalidateUserCache(id);

  return NextResponse.json({ agent: updatedAgent });
}
);

// DELETE /api/agents/[id] - Delete agent
export const DELETE = RequireRoles([UserRole.USER, UserRole.ADMIN])(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  // Verify the agent belongs to the current user
  const agent = await prisma.user.findFirst({
    where: {
      id: id,
        parentUserId: session!.user!.id,
      role: "AGENT" as any,
    } as any,
  });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  await prisma.user.delete({
    where: { id: id },
  });

  // Invalidate user cache after deletion
  await invalidateUserCache(id);

  return NextResponse.json({ message: "Agent deleted successfully" });
} 
); 
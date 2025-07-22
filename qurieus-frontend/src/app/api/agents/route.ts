import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { hash } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { RequireRoles, invalidateUserCache } from "@/utils/roleGuardsDecorator";

// NOTE: If you get type errors for UserRole.AGENT or parentUserId, run 'yarn prisma generate' to update types.

// POST /api/agents - Create/invite a new agent
export const POST = RequireRoles([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (request: Request) => {
  const session = await getServerSession(authOptions);
  const { name, email, password } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  // Check if agent already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);
  
  // Create agent user and agent record in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const agentUser = await tx.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "AGENT" as any,
      parentUserId: session!.user!.id,
      is_active: true,
      is_verified: true, // Optionally, set to false and send verification email
    } as any,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
    },
    });

    // Create the corresponding Agent record
    await tx.agent.create({
      data: {
        userId: agentUser.id,
        displayName: name,
        isOnline: false,
        isAvailable: true,
      },
    });

    return agentUser;
  });

  // TODO: Optionally send invite email here

  return NextResponse.json({ agent: result });
});

// GET /api/agents - List all agents for the current owner
export const GET = RequireRoles([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (request: Request) => {
  const session = await getServerSession(authOptions);
  const agents = await prisma.user.findMany({
    where: {
      parentUserId: session!.user!.id,
      role: "AGENT" as any,
    } as any,
    select: {
      id: true,
      name: true,
      email: true,
      is_active: true,
      created_at: true,
      agent: {
        select: {
          isOnline: true,
          isAvailable: true,
          currentChats: true
        }
      }
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ agents });
}); 
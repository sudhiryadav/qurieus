import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

// PATCH /api/agents/[id]/status - Toggle agent activation status
export const PATCH = RequireRoles([UserRole.USER, UserRole.ADMIN])(
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

  const updatedAgent = await prisma.user.update({
    where: { id: id },
    data: { is_active: !agent.is_active },
    select: {
      id: true,
      name: true,
      email: true,
      is_active: true,
      created_at: true,
    },
  });

  return NextResponse.json({ 
    agent: updatedAgent,
    message: `Agent ${updatedAgent.is_active ? 'activated' : 'deactivated'} successfully`
  });
} 
); 
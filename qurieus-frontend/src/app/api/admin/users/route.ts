import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/utils/prismaDB";

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
      subscription: {
        include: { plan: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(users);
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

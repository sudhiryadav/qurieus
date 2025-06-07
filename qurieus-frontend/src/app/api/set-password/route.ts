import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { password } = await request.json();
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashed },
  });
  return NextResponse.json({ message: "Password set successfully" });
} 
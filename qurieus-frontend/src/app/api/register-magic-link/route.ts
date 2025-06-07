import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: "",
        company: "",
        plan: "BASIC",
        subscription_type: "MONTHLY",
        subscription_start_date: new Date(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        is_active: true,
        is_verified: false,
        role: "USER",
        password: "",
      },
    });
  }
  return NextResponse.json({ message: "User pre-created for magic link." });
} 
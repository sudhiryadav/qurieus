import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) return NextResponse.json({ error: "Email and code are required" }, { status: 400 });

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        verification_token: code,
        verification_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: null,
        verification_expires: null,
      },
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json({ error: "Error verifying code" }, { status: 500 });
  }
} 
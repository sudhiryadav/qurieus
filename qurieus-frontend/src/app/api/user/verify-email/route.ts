import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/utils/prismaDB";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    // Find user with unexpired verification code
    const user = await prisma.user.findFirst({
      where: {
        email,
        verification_token: { not: null },
        verification_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Verify code
    const isValid = await compare(code, user.verification_token!);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: null,
        verification_expires: null,
      },
    });

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
} 
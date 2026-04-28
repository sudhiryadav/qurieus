import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/utils/prismaDB";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedCode = await hash(verificationCode, 12);

    // Update user with new verification code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verification_token: hashedCode,
        verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send new verification email
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json(
      { message: "Verification code resent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 }
    );
  }
} 
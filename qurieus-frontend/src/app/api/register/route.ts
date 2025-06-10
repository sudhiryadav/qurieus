import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/utils/prismaDB";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Generate verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedCode = await hash(verificationCode, 12);

    // Create user with verification code
    const user = await prisma.user.create({
      data: {
        name,
        email: email,
        password: await hash(password, 12),
        verification_token: hashedCode,
        verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json(
      { message: "Registration successful. Please check your email for verification code." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

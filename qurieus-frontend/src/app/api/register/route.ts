import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { createTransport } from "nodemailer";
import crypto from "crypto";

// Function to generate verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Function to send verification email
async function sendVerificationEmail(email: string, token: string) {
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  await transport.sendMail({
    to: email,
    from: process.env.SMTP_FROM_EMAIL,
    subject: "Verify your email address",
    html: `
      <div>
        <h1>Welcome to Qurieus!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });

  return expiresAt;
}

export async function POST(request: any) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (exist) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const verificationExpires = await sendVerificationEmail(email.toLowerCase(), verificationToken);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        company: "", // Required field
        plan: "BASIC" as const, // Using string literal type
        subscription_type: "MONTHLY" as const, // Using string literal type
        subscription_start_date: new Date(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        is_active: true,
        is_verified: false,
        verification_token: verificationToken,
        verification_expires: verificationExpires,
        role: "USER" as const,
      },
    });

    return NextResponse.json(
      { message: "User created successfully! Please check your email to verify your account." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Registration error:", error.message);
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}

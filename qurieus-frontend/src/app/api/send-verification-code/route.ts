import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { createTransport } from "nodemailer";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.is_verified) {
      return NextResponse.json({ error: "User is already verified" }, { status: 400 });
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        verification_token: verificationCode,
        verification_expires: verificationExpires,
      },
    });

    const transport = createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transport.sendMail({
      to: email,
      from: process.env.SMTP_FROM_EMAIL,
      subject: "Verify your email address",
      html: `
        <div>
          <h1>Welcome to Qurieus!</h1>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>This code will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Verification code sent!" });
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json({ error: "Error sending verification code" }, { status: 500 });
  }
} 
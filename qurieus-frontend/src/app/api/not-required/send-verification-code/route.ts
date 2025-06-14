import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

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

    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ message: "Verification code sent!" });
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json({ error: "Error sending verification code" }, { status: 500 });
  }
} 
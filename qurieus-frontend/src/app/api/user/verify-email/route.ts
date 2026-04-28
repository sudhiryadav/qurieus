import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/utils/prismaDB";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { email, code } = await req.json();

    logger.info("User Verify Email API: Processing email verification", { 
      email, 
      hasCode: !!code 
    });

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

    logger.info("User Verify Email API: User found, verifying code", { 
      email, 
      userId: user.id 
    });

    // Verify code
    const isValid = await compare(code, user.verification_token!);
    if (!isValid) {
      logger.warn("User Verify Email API: Invalid verification code", { 
        email, 
        userId: user.id 
      });
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

    const responseTime = Date.now() - startTime;
    logger.info("User Verify Email API: Email verified successfully", { 
      email, 
      userId: user.id,
      responseTime 
    });

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("User Verify Email API: Verification error", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
} 
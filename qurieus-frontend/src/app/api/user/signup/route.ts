import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/utils/prismaDB";
import { sendVerificationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/utils/rateLimit";

export async function POST(req: Request) {
  const startTime = Date.now();
  const ip = getClientIp(req);
  
  try {
    if (!checkRateLimit(`signup:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many signup attempts. Please try later." }, { status: 429 });
    }

    const { name, email, password } = await req.json();

    logger.info("User Signup API: Processing signup request", { 
      name, 
      email, 
      hasPassword: !!password 
    });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists but is not verified, update their verification code
      if (!existingUser.is_verified) {
        logger.info("User Signup API: Resending verification to existing unverified user", { 
          email, 
          userId: existingUser.id 
        });
        
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedCode = await hash(verificationCode, 12);

        await prisma.user.update({
          where: { email },
          data: {
            verification_token: hashedCode,
            verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });

        // Send new verification email
        await sendVerificationEmail(email, verificationCode);

        const responseTime = Date.now() - startTime;
        logger.info("User Signup API: Verification code resent successfully", { 
          email, 
          userId: existingUser.id,
          responseTime 
        });

        return NextResponse.json(
          { message: "Verification code resent. Please check your email." },
          { status: 200 }
        );
      }

      // If user is already verified, return conflict status
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }


    // Generate verification code for new user
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedCode = await hash(verificationCode, 12);

    // Create new user
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
    logger.info("User Signup API: Sending verification email to new user", { 
      email, 
      userId: user.id
    });
    await sendVerificationEmail(email, verificationCode);

    const responseTime = Date.now() - startTime;
    logger.info("User Signup API: New user created successfully", { 
      email, 
      userId: user.id,
      responseTime 
    });

    return NextResponse.json(
      { message: "Registration successful. Please check your email for verification code." },
      { status: 201 }
    );
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("User Signup API: Registration error", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

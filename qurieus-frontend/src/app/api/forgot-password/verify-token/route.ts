import { prisma } from "@/utils/prismaDB";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const POST = async (request: Request) => {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { token } = body;

    logger.info("Verify Token API: Verifying reset token", { 
      tokenLength: token?.length || 0 
    });

    if (!token) {
      return new NextResponse("Missing Fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        passwordResetToken: token,
        passwordResetTokenExp: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return new NextResponse("Invalid Token or Token Expired", { status: 400 });
    }

    const responseTime = Date.now() - startTime;
    logger.info("Verify Token API: Token verified successfully", { 
      userId: user.id,
      email: user.email,
      responseTime 
    });

    return NextResponse.json(user);
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Verify Token API: Error verifying token", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

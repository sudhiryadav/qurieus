import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from '@/utils/prismaDB';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn("Link Visitor API: Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = session.user.id;
    const { visitorId } = await request.json();
    
    logger.info("Link Visitor API: Linking visitor to user", { 
      userId, 
      visitorId 
    });

    if (!visitorId) {
      logger.warn("Link Visitor API: Missing visitor ID", { userId });
      return NextResponse.json(
        { error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    // Find existing visitor session or create new one
    const existingSession = await prisma.visitorSession.findFirst({
      where: { visitorId }
    });

    if (existingSession) {
      // Update existing session with user ID
      await prisma.visitorSession.update({
        where: { id: existingSession.id },
        data: {
          userId: session.user.id,
          endTime: new Date(),
        },
      });
    } else {
      // Create new visitor session
      await prisma.visitorSession.create({
        data: {
          visitorId,
          userId: session.user.id,
          userAgent: request.headers.get("user-agent") || "Unknown",
          ipAddress: request.headers.get("x-forwarded-for") || "Unknown",
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          queries: 0,
        },
      });
    }

    // Update existing query analytics to link visitor to user
    await prisma.queryAnalytics.updateMany({
      where: {
        visitorId,
        userId: { not: session.user.id } // Only update if not already linked
      },
      data: {
        userId: session.user.id,
      },
    });

    // Update chat conversations to link visitor to user
    await prisma.chatConversation.updateMany({
      where: {
        visitorId,
        userId: { not: session.user.id } // Only update if not already linked
      },
      data: {
        userId: session.user.id,
      },
    });

    const responseTime = Date.now() - startTime;
    logger.info("Link Visitor API: Visitor linked successfully", { 
      userId, 
      visitorId,
      responseTime 
    });

    return NextResponse.json({ 
      success: true, 
      message: "Visitor linked to user successfully" 
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Link Visitor API: Error linking visitor", { 
      userId,
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Failed to link visitor to user" },
      { status: 500 }
    );
  }
} 
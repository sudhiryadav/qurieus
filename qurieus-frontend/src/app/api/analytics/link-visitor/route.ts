import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from '@/utils/prismaDB';
import { logger } from '@/lib/logger';
import { OptionalAuth, RequireUser } from '@/utils/roleGuardsDecorator';

export const POST = OptionalAuth("Link Visitor API")(async (request: NextRequest, user: any) => {
  const startTime = Date.now();
  const userId = user.id;
  
  try {
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

    // Ensure VisitorInfo record exists first
    await prisma.visitorInfo.upsert({
      where: { visitorId },
      update: {
        lastSeen: new Date(),
        totalVisits: { increment: 1 }
      },
      create: {
        visitorId,
        firstSeen: new Date(),
        lastSeen: new Date(),
        totalVisits: 1,
        totalQueries: 0,
        isConverted: false
      }
    });

    // Find existing visitor session or create new one
    const existingSession = await prisma.visitorSession.findFirst({
      where: { visitorId }
    });

    if (existingSession) {
      // Update existing session with user ID
      await prisma.visitorSession.update({
        where: { id: existingSession.id },
        data: {
          userId: userId,
          endTime: new Date(),
        },
      });
    } else {
      // Create new visitor session
      await prisma.visitorSession.create({
        data: {
          visitorId,
          userId: userId,
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
        userId: { not: userId } // Only update if not already linked
      },
      data: {
        userId: userId,
      },
    });

    // Handle chat conversations more carefully due to unique constraint
    // First, check if there are any existing conversations with this visitorId and userId
    const existingConversations = await prisma.chatConversation.findMany({
      where: {
        visitorId,
        userId: userId
      }
    });

    if (existingConversations.length === 0) {
      // No existing conversations with this visitorId and userId, safe to update
      await prisma.chatConversation.updateMany({
        where: {
          visitorId,
          userId: { not: userId } // Only update if not already linked
        },
        data: {
          userId: userId,
        },
      });
    } else {
      // There are existing conversations, we need to handle this differently
      // For now, we'll just log this case and not update to avoid constraint violations
      logger.info("Link Visitor API: Skipping chat conversation updates due to existing conversations", {
        userId: userId,
        visitorId,
        existingConversationCount: existingConversations.length
      });
    }

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
    
    // Provide more specific error messages based on the error type
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Visitor already linked to this user" },
        { status: 409 }
      );
    } else if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid user or visitor reference" },
        { status: 400 }
      );
    } else if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Visitor record not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to link visitor to user" },
      { status: 500 }
    );
  }
}); 
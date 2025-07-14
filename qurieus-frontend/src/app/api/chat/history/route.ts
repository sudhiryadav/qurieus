import { NextResponse } from "next/server";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { errorResponse } from "@/utils/responser";
import { getServerSession } from "next-auth";
import { logger } from "@/lib/logger";
import { OptionalAuth, RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from "@prisma/client";

export const GET = OptionalAuth("Chat History API")(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');
    const visitorId = searchParams.get('visitorId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!conversationId && !visitorId) {
      return errorResponse({ error: "conversationId or visitorId is required", status: 400 });
    }

    // Build where clause
    const whereClause: any = {};
    if (conversationId) {
      whereClause.conversationId = conversationId;
    } else if (visitorId) {
      // For visitorId queries, we need either a userId or to handle unauthenticated access
      if (userId) {
        whereClause.conversation = {
          visitorId: visitorId,
          userId: userId
        };
      } else {
        // If no user is authenticated, just filter by visitorId
        whereClause.conversation = {
          visitorId: visitorId
        };
      }
    }

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
      include: {
        agent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.chatMessage.count({
      where: whereClause
    });

    logger.info("Chat History API: Retrieved chat history", { 
      userId,
      conversationId,
      visitorId,
      messageCount: messages.length,
      totalCount
    });

    return NextResponse.json({
      messages,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    logger.error("Chat History API: Error retrieving chat history", { 
      error: error instanceof Error ? error.message : String(error)
    });
    return errorResponse({ 
      error: "An error occurred while retrieving chat history", 
      status: 500 
    });
  }
}); 
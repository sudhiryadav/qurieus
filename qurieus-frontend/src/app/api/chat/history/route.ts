import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get('visitorId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    logger.info("Chat History API: Fetching chat history", { 
      visitorId, 
      userId, 
      limit 
    });

    if (!visitorId || !userId) {
      logger.warn("Chat History API: Missing required parameters", { visitorId, userId });
      return NextResponse.json([], { status: 400 });
    }

    const conversation = await prisma.chatConversation.findFirst({
      where: { visitorId, userId },
    });

    if (!conversation) {
      logger.info("Chat History API: No conversation found", { visitorId, userId });
      return NextResponse.json([], { status: 200 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { role: true, content: true },
    });

    const responseTime = Date.now() - startTime;
    logger.info("Chat History API: Chat history retrieved successfully", { 
      visitorId, 
      userId, 
      messageCount: messages.length,
      responseTime 
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Chat History API: Error fetching chat history", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json([], { status: 500 });
  }
} 
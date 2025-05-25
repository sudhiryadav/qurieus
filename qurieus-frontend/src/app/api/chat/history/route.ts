import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const visitorId = searchParams.get('visitorId');
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (!visitorId || !userId) {
    return NextResponse.json([], { status: 400 });
  }

  const conversation = await prisma.chatConversation.findFirst({
    where: { visitorId, userId },
  });

  if (!conversation) return NextResponse.json([], { status: 200 });

  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: { role: true, content: true },
  });

  return NextResponse.json(messages, { status: 200 });
} 
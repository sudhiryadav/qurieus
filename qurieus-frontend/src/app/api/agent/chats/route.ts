import { NextRequest, NextResponse } from "next/server";
import { RequireAgent } from "@/utils/roleGuardsDecorator";
import { prisma } from "@/utils/prismaDB";

export const GET = RequireAgent("Agent Chats API")(async (req: NextRequest, user: any) => {
  // Get URL parameters
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Build where clause
  const whereClause: any = {
    agentId: user.id
  };

  if (status) {
    whereClause.status = status;
  }

  // Get assigned chats
  const chats = await prisma.agentChat.findMany({
    where: whereClause,
    include: {
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1 // Get latest message
          },
          visitorInfo: {
            select: {
              name: true,
              email: true,
              company: true
            }
          }
        }
      }
    },
    orderBy: [
      { assignedAt: 'desc' }
    ],
    take: limit,
    skip: offset
  });

  // Get total count for pagination
  const totalCount = await prisma.agentChat.count({
    where: whereClause
  });

  return NextResponse.json({
    chats,
    pagination: {
      total: totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount
    }
  });
}); 
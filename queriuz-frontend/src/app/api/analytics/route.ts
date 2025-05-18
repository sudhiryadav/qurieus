import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/utils/prismaDB';

interface MessageByDate {
  createdAt: Date;
  _count: number;
}

interface KeywordCount {
  content: string;
  _count: number;
}

interface DeviceStats {
  deviceType: string;
  _count: number;
}

interface BrowserStats {
  browser: string;
  _count: number;
}

interface OsStats {
  os: string;
  _count: number;
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get time range from query parameters
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      default: // 7d
        startDate.setDate(now.getDate() - 7);
    }

    // Get analytics data
    const [
      totalConversations,
      totalMessages,
      messagesByDate,
      topKeywords,
      uniqueVisitors,
      responseTime,
      deviceStats,
      browserStats,
      osStats,
      avgMessagesPerConversation,
      avgResponseTime
    ] = await Promise.all([
      // Total conversations
      prisma.chatConversation.count({
        where: {
          userId,
          firstSeen: { gte: startDate }
        }
      }),
      
      // Total messages
      prisma.chatMessage.count({
        where: {
          conversation: {
            userId,
            firstSeen: { gte: startDate }
          }
        }
      }),
      
      // Messages by date
      prisma.chatMessage.groupBy({
        by: ['createdAt'],
        where: {
          conversation: {
            userId,
            firstSeen: { gte: startDate }
          }
        },
        _count: true,
        orderBy: {
          createdAt: 'asc'
        }
      }),
      
      // Top keywords
      prisma.chatMessage.groupBy({
        by: ['content'],
        where: {
          conversation: {
            userId,
            firstSeen: { gte: startDate }
          },
          role: 'user'
        },
        _count: true,
        orderBy: {
          _count: {
            content: 'desc'
          }
        },
        take: 5
      }),
      
      // Unique visitors
      prisma.chatConversation.groupBy({
        by: ['visitorId'],
        where: {
          userId,
          firstSeen: { gte: startDate }
        },
        _count: true
      }),
      
      // Response time stats
      prisma.chatConversation.aggregate({
        where: {
          userId,
          firstSeen: { gte: startDate }
        },
        _avg: {
          avgResponseTime: true
        },
        _min: {
          avgResponseTime: true
        },
        _max: {
          avgResponseTime: true
        }
      }),

      // Device stats
      prisma.chatConversation.groupBy({
        by: ['deviceType'],
        where: {
          userId,
          firstSeen: { gte: startDate }
        },
        _count: true
      }),

      // Browser stats
      prisma.chatConversation.groupBy({
        by: ['browser'],
        where: {
          userId,
          firstSeen: { gte: startDate }
        },
        _count: true
      }),

      // OS stats
      prisma.chatConversation.groupBy({
        by: ['os'],
        where: {
          userId,
          firstSeen: { gte: startDate }
        },
        _count: true
      }),

      // Average messages per conversation
      prisma.chatConversation.aggregate({
        where: {
          userId,
          firstSeen: { gte: startDate }
        },
        _avg: {
          totalMessages: true
        }
      }),

      // Average response time across conversations
      prisma.chatConversation.aggregate({
        where: {
          userId,
          firstSeen: { gte: startDate }
        },
        _avg: {
          avgResponseTime: true
        }
      })
    ]);

    // Format messages by date
    const formattedMessagesByDate = (messagesByDate as MessageByDate[]).map(msg => ({
      date: msg.createdAt.toISOString().split('T')[0],
      count: msg._count
    }));

    // Format top keywords
    const formattedTopKeywords = (topKeywords as KeywordCount[]).map(kw => ({
      keyword: kw.content,
      count: kw._count
    }));

    return NextResponse.json({
      totalConversations,
      totalMessages,
      averageMessagesPerDay: Math.round(totalMessages / ((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
      topKeywords: formattedTopKeywords,
      messagesByDate: formattedMessagesByDate,
      uniqueVisitors: uniqueVisitors.length,
      responseTime: {
        average: responseTime._avg.avgResponseTime || 0,
        min: responseTime._min.avgResponseTime || 0,
        max: responseTime._max.avgResponseTime || 0
      },
      deviceStats: (deviceStats as DeviceStats[]).map(stat => ({
        device: stat.deviceType || 'unknown',
        count: stat._count
      })),
      browserStats: (browserStats as BrowserStats[]).map(stat => ({
        browser: stat.browser || 'unknown',
        count: stat._count
      })),
      osStats: (osStats as OsStats[]).map(stat => ({
        os: stat.os || 'unknown',
        count: stat._count
      })),
      avgMessagesPerConversation: avgMessagesPerConversation._avg.totalMessages || 0,
      avgResponseTime: avgResponseTime._avg.avgResponseTime || 0
    });
  } catch (error: any) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: `Failed to fetch analytics data: ${error.message}` },
      { status: 500 }
    );
  }
} 
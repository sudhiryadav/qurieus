import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "7d";
    const days = parseInt(timeRange.replace('d', ''));

    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Get total queries
    const totalQueries = await prisma.queryAnalytics.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get successful queries
    const successfulQueries = await prisma.queryAnalytics.count({
      where: {
        userId: session.user.id,
        success: true,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get average response time
    const avgResponseTime = await prisma.queryAnalytics.aggregate({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _avg: {
        responseTime: true
      }
    });

    // Get queries by date for trend analysis
    const queriesByDate = await prisma.queryAnalytics.groupBy({
      by: ['createdAt'],
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get visitor statistics
    const visitorStats = await prisma.visitorSession.groupBy({
      by: ['visitorId'],
      where: {
        userId: session.user.id,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        queries: true
      },
      _avg: {
        duration: true
      },
      orderBy: {
        _count: {
          queries: 'desc'
        }
      },
      take: 5
    });

    // Format the response
    return NextResponse.json({
      timeRange,
      userId: session.user.id,
      totalQueries,
      successfulQueries,
      successRate: totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0,
      averageResponseTime: avgResponseTime._avg.responseTime || 0,
      queriesByDate: queriesByDate.map(q => ({
        date: q.createdAt,
        count: q._count
      })),
      topVisitors: visitorStats.map(v => ({
        visitorId: v.visitorId,
        queryCount: v._count.queries,
        averageDuration: v._avg.duration
      }))
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch analytics" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { type, data } = await req.json();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating analytics:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 
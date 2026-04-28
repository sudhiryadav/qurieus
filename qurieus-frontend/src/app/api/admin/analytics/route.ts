import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { logger } from '@/lib/logger';
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.SUPER_ADMIN, UserRole.USER])(async (request: Request) => {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    userId = session!.user!.id;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "7d";
    const days = parseInt(timeRange.replace('d', ''));

    logger.info("Analytics API: Fetching analytics data", { 
      userId, 
      timeRange, 
      days 
    });

    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Get total queries
    const totalQueries = await prisma.queryAnalytics.count({
      where: {
        userId: session!.user!.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get successful queries
    const successfulQueries = await prisma.queryAnalytics.count({
      where: {
        userId: session!.user!.id,
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
        userId: session!.user!.id,
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
        userId: session!.user!.id,
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
        userId: session!.user!.id,
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
    const responseTime = Date.now() - startTime;
    logger.info("Analytics API: Analytics data retrieved successfully", { 
      userId, 
      timeRange,
      totalQueries,
      successfulQueries,
      responseTime 
    });

    return NextResponse.json({
      timeRange,
      userId: session!.user!.id,
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
    const responseTime = Date.now() - startTime;
    logger.error("Analytics API: Error fetching analytics", { 
      userId, 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch analytics" },
      { status: error.response?.status || 500 }
    );
  }
});

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    userId = session!.user!.id;
    const { type, data } = await req.json();

    logger.info("Analytics API: Processing analytics update", { 
      userId, 
      type 
    });

    const responseTime = Date.now() - startTime;
    logger.info("Analytics API: Analytics update completed", { 
      userId, 
      type, 
      responseTime 
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Analytics API: Error updating analytics", { 
      userId, 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}); 
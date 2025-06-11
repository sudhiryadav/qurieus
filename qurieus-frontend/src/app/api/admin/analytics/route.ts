import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { invalidateAnalyticsCache } from '@/utils/cache';
import { subDays } from 'date-fns';

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

interface DocumentAnalytics {
  documentId: string;
  views: number;
  queries: number;
  avgResponseTime: number;
  successRate: number;
}

interface QueryAnalytics {
  totalQueries: number;
  avgResponseTime: number;
  successRate: number;
  topQueries: { query: string; count: number }[];
  queriesByHour: { hour: number; count: number }[];
}

interface VisitorAnalytics {
  totalVisitors: number;
  returningVisitors: number;
  avgSessionDuration: number;
  avgQueriesPerSession: number;
  topReferrers: { referrer: string; count: number }[];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const [queryStats, recentQueries] = await Promise.all([
      prisma.queryAnalytics.groupBy({
        by: ['documentId'],
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        _count: {
          _all: true,
          success: true,
        },
        _avg: {
          responseTime: true,
        },
      }),
      prisma.queryAnalytics.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ]);

    const totalQueries = queryStats.reduce((acc, stat) => acc + stat._count._all, 0);
    const successfulQueries = queryStats.reduce((acc, stat) => acc + stat._count.success, 0);
    const avgResponseTime = queryStats.reduce((acc, stat) => acc + (stat._avg.responseTime || 0), 0) / queryStats.length;
    const successRate = (successfulQueries / totalQueries) * 100;

    return NextResponse.json({
      totalQueries,
      avgResponseTime,
      successRate,
      recentQueries,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
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

    // Invalidate cache when new data is added
    await invalidateAnalyticsCache(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating analytics:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 
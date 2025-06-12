import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const days = parseInt(timeRange.replace('d', ''));

    const userId = session.user.id;
    const now = new Date();
    const startDate = startOfDay(subDays(now, days));
    const endDate = endOfDay(now);

    // Get total queries and messages
    const totalQueries = await prisma.queryAnalytics.count({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Get average messages per day
    const queriesByDate = await prisma.queryAnalytics.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    });

    const avgQueriesPerDay = totalQueries / days;

    // Get top keywords from queries
    const queries = await prisma.queryAnalytics.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        query: true
      }
    });

    // Simple keyword extraction (split by spaces and count)
    const keywords = queries.reduce((acc: { [key: string]: number }, curr) => {
      const words = curr.query.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) { // Only count words longer than 3 characters
          acc[word] = (acc[word] || 0) + 1;
        }
      });
      return acc;
    }, {});

    const topKeywords = Object.entries(keywords)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get messages by date
    const messagesByDate = await prisma.queryAnalytics.groupBy({
      by: ['createdAt'],
      where: {
        userId,
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

    // Get response time stats
    const responseTimeStats = await prisma.queryAnalytics.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _avg: {
        responseTime: true
      },
      _min: {
        responseTime: true
      },
      _max: {
        responseTime: true
      }
    });

    // Get device stats from visitor sessions
    const deviceStats = await prisma.visitorSession.groupBy({
      by: ['userAgent'],
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    });

    // Format device stats
    const formattedDeviceStats = deviceStats.map(stat => ({
      device: stat.userAgent.includes('Mobile') ? 'Mobile' : 
              stat.userAgent.includes('Tablet') ? 'Tablet' : 'Desktop',
      count: stat._count
    }));

    // Get browser stats
    const browserStats = deviceStats.map(stat => {
      const ua = stat.userAgent.toLowerCase();
      let browser = 'Other';
      if (ua.includes('chrome')) browser = 'Chrome';
      else if (ua.includes('firefox')) browser = 'Firefox';
      else if (ua.includes('safari')) browser = 'Safari';
      else if (ua.includes('edge')) browser = 'Edge';
      return { browser, count: stat._count };
    });

    // Get OS stats
    const osStats = deviceStats.map(stat => {
      const ua = stat.userAgent.toLowerCase();
      let os = 'Other';
      if (ua.includes('windows')) os = 'Windows';
      else if (ua.includes('mac')) os = 'macOS';
      else if (ua.includes('linux')) os = 'Linux';
      else if (ua.includes('android')) os = 'Android';
      else if (ua.includes('ios')) os = 'iOS';
      return { os, count: stat._count };
    });

    return NextResponse.json({
      totalQueries,
      avgQueriesPerDay,
      topKeywords,
      messagesByDate: messagesByDate.map(day => ({
        date: format(day.createdAt, 'yyyy-MM-dd'),
        count: day._count
      })),
      responseTime: {
        average: responseTimeStats._avg.responseTime || 0,
        min: responseTimeStats._min.responseTime || 0,
        max: responseTimeStats._max.responseTime || 0
      },
      deviceStats: formattedDeviceStats,
      browserStats,
      osStats
    });
  } catch (error) {
    console.error('Error fetching detailed analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailed analytics' },
      { status: 500 }
    );
  }
} 
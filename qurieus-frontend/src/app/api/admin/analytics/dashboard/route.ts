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

    const userId = session.user.id;
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    // Get total queries
    const totalQueries = await prisma.queryAnalytics.count({
      where: { userId }
    });

    // Get successful queries
    const successfulQueries = await prisma.queryAnalytics.count({
      where: {
        userId,
        success: true
      }
    });

    // Get average response time
    const avgResponseTime = await prisma.queryAnalytics.aggregate({
      where: { userId },
      _avg: {
        responseTime: true
      }
    });

    // Get weekly activity (query hits per day)
    const weeklyActivity = await prisma.queryAnalytics.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
          lte: now
        }
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Format weekly activity data
    const formattedWeeklyActivity = weeklyActivity.map(day => ({
      date: format(day.createdAt, 'EEE'),
      count: day._count
    }));

    // Get trending queries (by query type)
    const trendingQueries = await prisma.queryAnalytics.groupBy({
      by: ['query'],
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
          lte: now
        }
      },
      _count: true,
      orderBy: {
        _count: {
          query: 'desc'
        }
      },
      take: 3
    });

    // Format trending queries data
    const formattedTrendingQueries = trendingQueries.map(query => ({
      name: query.query.length > 20 ? query.query.substring(0, 20) + '...' : query.query,
      count: query._count
    }));

    // Get recent activity
    const recentActivity = await prisma.queryAnalytics.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
          lte: now
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    // Format recent activity
    const formattedRecentActivity = recentActivity.map(activity => ({
      date: format(activity.createdAt, 'MMM d, h:mm a'),
      type: activity.success ? 'Successful Query' : 'Failed Query',
      details: activity.query.length > 50 ? activity.query.substring(0, 50) + '...' : activity.query
    }));

    return NextResponse.json({
      totalQueries,
      successfulQueries,
      successRate: totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0,
      averageResponseTime: avgResponseTime._avg.responseTime || 0,
      weeklyActivity: formattedWeeklyActivity,
      trendingQueries: formattedTrendingQueries,
      recentActivity: formattedRecentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    );
  }
} 
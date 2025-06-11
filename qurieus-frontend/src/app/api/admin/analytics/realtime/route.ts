import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get active visitors in the last 5 minutes
    const activeVisitors = await prisma.visitorSession.findMany({
      where: {
        userId: session.user.id,
        endTime: { gte: fiveMinutesAgo },
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 10,
    });

    // Get recent queries in the last 5 minutes
    const recentQueries = await prisma.queryAnalytics.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: fiveMinutesAgo },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        document: {
          select: {
            fileName: true,
          },
        },
      },
    });

    return NextResponse.json({
      activeVisitors,
      recentQueries,
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
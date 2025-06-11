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

    // Get query statistics for the last 5 minutes
    const queryStats = await prisma.queryAnalytics.aggregate({
      where: {
        userId: session.user.id,
        createdAt: { gte: fiveMinutesAgo },
      },
      _count: true,
      _avg: {
        responseTime: true,
      },
      _sum: {
        responseTime: true,
      },
    });

    // Get active documents (documents that had queries in the last 5 minutes)
    const activeDocuments = await prisma.queryAnalytics.groupBy({
      by: ['documentId'],
      where: {
        userId: session.user.id,
        createdAt: { gte: fiveMinutesAgo },
      },
      _count: true,
      orderBy: {
        _count: {
          documentId: 'desc',
        },
      },
      take: 5,
    });

    // Get document details for active documents
    const documentDetails = await prisma.document.findMany({
      where: {
        id: {
          in: activeDocuments.map(doc => doc.documentId),
        },
      },
      select: {
        id: true,
        fileName: true,
      },
    });

    // Format active documents with their names
    const formattedActiveDocuments = activeDocuments.map(doc => {
      const details = documentDetails.find(d => d.id === doc.documentId);
      return {
        documentId: doc.documentId,
        fileName: details?.fileName || 'Unknown Document',
        queryCount: doc._count,
      };
    });

    return NextResponse.json({
      activeVisitors,
      recentQueries,
      queryStats: {
        totalQueries: queryStats._count,
        averageResponseTime: queryStats._avg.responseTime || 0,
        totalResponseTime: queryStats._sum.responseTime || 0,
      },
      activeDocuments: formattedActiveDocuments,
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
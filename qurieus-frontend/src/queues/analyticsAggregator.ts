import Queue from 'bull';
import { prisma } from '@/utils/prismaDB';
import { subDays } from 'date-fns';

const analyticsQueue = new Queue('analytics-aggregation', process.env.REDIS_URL);

// Run analytics aggregation daily
analyticsQueue.add(
  'aggregate-daily',
  {},
  {
    repeat: {
      cron: '0 0 * * *', // Run at midnight every day
    },
  }
);

analyticsQueue.process('aggregate-daily', async () => {
  try {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Get all users
    const users = await prisma.user.findMany({
      where: {
        is_active: true,
      },
    });

    for (const user of users) {
      // Aggregate query analytics
      const queryStats = await prisma.queryAnalytics.groupBy({
        by: ['documentId'],
        where: {
          document: {
            userId: user.id,
            uploadedAt: { gte: thirtyDaysAgo },
          },
        },
        _avg: {
          responseTime: true,
        },
        _count: {
          success: true,
        },
      });

      // Aggregate visitor analytics
      const visitorStats = await prisma.visitorSession.groupBy({
        by: ['userId'],
        where: {
          userId: user.id,
          startTime: { gte: thirtyDaysAgo },
        },
        _avg: {
          duration: true,
          queries: true,
        },
        _count: {
          visitorId: true,
        },
      });

      // Store aggregated data
      await prisma.log.create({
        data: {
          userId: user.id,
          level: 'info',
          message: 'Analytics aggregation completed',
          meta: {
            queryStats,
            visitorStats,
            timestamp: now,
          },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error aggregating analytics:', error);
    throw error;
  }
});

// Clean up old analytics data
analyticsQueue.add(
  'cleanup-old-data',
  {},
  {
    repeat: {
      cron: '0 0 * * 0', // Run weekly
    },
  }
);

analyticsQueue.process('cleanup-old-data', async () => {
  try {
    const ninetyDaysAgo = subDays(new Date(), 90);

    // Delete old analytics data
    await Promise.all([
      prisma.queryAnalytics.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
        },
      }),
      prisma.visitorSession.deleteMany({
        where: {
          startTime: { lt: ninetyDaysAgo },
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error cleaning up old analytics data:', error);
    throw error;
  }
});

export default analyticsQueue; 
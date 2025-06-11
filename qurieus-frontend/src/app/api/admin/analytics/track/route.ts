import { prisma } from '@/utils/prismaDB';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      userId, 
      documentId, 
      query, 
      response, 
      responseTime, 
      visitorId, 
      success,
      sources,
      error,
      userAgent,
      ipAddress
    } = body;

    if (!userId || !documentId || !query || !visitorId || !userAgent || !ipAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create or update visitor session
      const visitorSession = await tx.visitorSession.create({
        data: {
          visitorId,
          userId,
          userAgent,
          ipAddress,
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          queries: 1
        }
      });

      // Create query analytics entry
      const analytics = await tx.queryAnalytics.create({
        data: {
          userId,
          documentId,
          query,
          response: response || '',
          responseTime: responseTime || 0,
          visitorId,
          success: success || false,
          error: error || null
        }
      });

      return { analytics, visitorSession };
    });

    return NextResponse.json(result.analytics);
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
} 
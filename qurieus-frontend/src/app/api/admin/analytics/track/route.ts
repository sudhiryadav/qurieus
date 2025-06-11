import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/utils/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, documentId, query, response, responseTime, visitorId, success } = body;

    if (!userId || !documentId || !query || !visitorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analytics = await prisma.queryAnalytics.create({
      data: {
        userId,
        documentId,
        query,
        response: response || '',
        responseTime: responseTime || 0,
        visitorId,
        success: success || false
      },
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
} 
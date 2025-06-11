import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, visitorId, userAgent, ipAddress } = body;

    if (!userId || !visitorId || !userAgent || !ipAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date();
    const visitorSession = await prisma.visitorSession.create({
      data: {
        userId,
        visitorId,
        userAgent,
        ipAddress,
        startTime: now,
        endTime: now,
        duration: 0,
        queries: 0
      },
    });

    return NextResponse.json(visitorSession);
  } catch (error) {
    console.error('Error creating visitor session:', error);
    return NextResponse.json(
      { error: 'Failed to create visitor session' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { visitorId, userId, queries } = body;

    if (!visitorId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date();
    const visitorSession = await prisma.visitorSession.update({
      where: {
        visitorId_userId: {
          visitorId,
          userId
        }
      },
      data: {
        endTime: now,
        duration: Math.floor((now.getTime() - new Date().getTime()) / 1000),
        queries: queries || 0
      },
    });

    return NextResponse.json(visitorSession);
  } catch (error) {
    console.error('Error updating visitor session:', error);
    return NextResponse.json(
      { error: 'Failed to update visitor session' },
      { status: 500 }
    );
  }
} 
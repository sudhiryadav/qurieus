import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { userId, level, message, meta } = await req.json();

    await prisma.log.create({
      data: { userId, level, message, meta },
    });

    // Forward to Sentry/LogRocket using logger utility (do not log to backend again)
    const loggerOptions = { logToSentry: false, logToLogRocket: false, logToBackend: true };
    if (level === 'error') {
    } else if (level === 'warn') {
    } else {
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
} 
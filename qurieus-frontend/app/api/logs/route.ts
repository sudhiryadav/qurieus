import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';

export async function POST(req: NextRequest) {
  try {
    const { userId, level, message, meta } = await req.json();
    
    await prisma.log.create({
      data: { userId, level, message, meta },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
} 
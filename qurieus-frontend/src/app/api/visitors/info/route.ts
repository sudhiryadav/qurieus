import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { visitorId, name, email, phone, company, source = 'chat_widget' } = await request.json();
    
    logger.info("Visitor Info API: Saving visitor information", { 
      visitorId, 
      name, 
      email, 
      hasPhone: !!phone,
      hasCompany: !!company,
      source 
    });

    if (!visitorId) {
      logger.warn("Visitor Info API: Missing visitor ID");
      return NextResponse.json(
        { error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    if (!name || !email) {
      logger.warn("Visitor Info API: Missing required fields", { visitorId });
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn("Visitor Info API: Invalid email format", { visitorId, email });
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Upsert visitor information
    const visitorInfo = await prisma.visitorInfo.upsert({
      where: { visitorId },
      update: {
        name,
        email,
        phone,
        company,
        source,
        lastSeen: new Date(),
        totalVisits: { increment: 1 }
      },
      create: {
        visitorId,
        name,
        email,
        phone,
        company,
        source,
        firstSeen: new Date(),
        lastSeen: new Date(),
        totalVisits: 1
      }
    });

    const responseTime = Date.now() - startTime;
    logger.info("Visitor Info API: Visitor information saved successfully", { 
      visitorId, 
      email,
      responseTime 
    });

    return NextResponse.json({ 
      success: true, 
      message: "Visitor information saved successfully",
      visitorInfo
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Visitor Info API: Error saving visitor information", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Failed to save visitor information" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitorId');
    
    if (!visitorId) {
      logger.warn("Visitor Info API: Missing visitor ID in GET request");
      return NextResponse.json(
        { error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    const visitorInfo = await prisma.visitorInfo.findUnique({
      where: { visitorId },
      include: {
        conversations: {
          orderBy: { lastSeen: 'desc' },
          take: 5
        },
        analytics: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    const responseTime = Date.now() - startTime;
    logger.info("Visitor Info API: Visitor information retrieved", { 
      visitorId, 
      found: !!visitorInfo,
      responseTime 
    });

    return NextResponse.json({ visitorInfo });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Visitor Info API: Error retrieving visitor information", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Failed to retrieve visitor information" },
      { status: 500 }
    );
  }
} 
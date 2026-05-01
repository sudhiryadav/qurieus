import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prismaDB';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';
import { corsResponse, corsErrorResponse, createOptionsHandler } from '@/utils/cors';
import { checkRateLimit, getClientIp } from '@/utils/rateLimit';

// Handle OPTIONS request for CORS preflight
export const OPTIONS = createOptionsHandler();

const maskApiKey = (value?: string | null) => {
  if (!value) return "";
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

const normalizeText = (value: unknown, maxLength: number): string => {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIp(request);
  
  try {
    if (!checkRateLimit(`visitor-info:${ip}`, 30, 10 * 60 * 1000)) {
      return corsErrorResponse("Too many requests", 429);
    }

    // Get API key from headers
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return corsErrorResponse("API key is required", 401);
    }

    // Validate API key by checking if user exists
    const user = await prisma.user.findUnique({
      where: { id: apiKey },
      select: { id: true, email: true }
    });

    if (!user) {
      return corsErrorResponse("Invalid API key", 401);
    }

    const payload = await request.json();
    const visitorId = normalizeText(payload?.visitorId, 200);
    const name = normalizeText(payload?.name, 120);
    const email = normalizeText(payload?.email, 254);
    const phone = normalizeText(payload?.phone, 40) || null;
    const company = normalizeText(payload?.company, 120) || null;
    const source = normalizeText(payload?.source, 50) || "chat_widget";
    
    logger.info("Visitor Info API: Saving visitor information", { 
      visitorId, 
      name, 
      email, 
      hasPhone: !!phone,
      hasCompany: !!company,
      source,
      apiKey: maskApiKey(apiKey)
    });

    if (!visitorId) {
      return corsErrorResponse("Visitor ID is required", 400);
    }

    if (!name || !email) {
      return corsErrorResponse("Name and email are required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return corsErrorResponse("Invalid email format", 400);
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

    // Send email notification to user
    try {
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: `New Chat Visitor: ${name} (${email})`,
          template: "visitor-notification",
          context: {
            name,
            email,
            phone,
            company,
            visitorId,
            source,
            timestamp: new Date().toLocaleString(),
            year: new Date().getFullYear()
          }
        });

        logger.info("Visitor Info API: Support notification email sent", { 
          visitorId, 
          email, 
          userEmail: user.email
        });
      }
    } catch (emailError) {
      logger.error("Visitor Info API: Error sending support notification email", { 
        visitorId, 
        email, 
        error: emailError instanceof Error ? emailError.message : String(emailError) 
      });
      // Don't fail the request if email fails
    }

    const responseTime = Date.now() - startTime;
    logger.info("Visitor Info API: Visitor information saved successfully", { 
      visitorId, 
      email,
      responseTime 
    });

    return corsResponse({ 
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
    
    return corsErrorResponse("Failed to save visitor information", 500);
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIp(request);
  
  try {
    if (!checkRateLimit(`visitor-info-read:${ip}`, 60, 10 * 60 * 1000)) {
      return corsErrorResponse("Too many requests", 429);
    }

    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('visitorId');
    const apiKey = request.headers.get('x-api-key');
    
    if (!visitorId) {
      return corsErrorResponse("Visitor ID is required", 400);
    }
    if (!apiKey) {
      return corsErrorResponse("API key is required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: apiKey },
      select: { id: true },
    });
    if (!user) {
      return corsErrorResponse("Invalid API key", 401);
    }

    // Enforce tenant ownership before returning visitor data.
    const hasConversationAccess = await prisma.chatConversation.findFirst({
      where: {
        visitorId,
        userId: apiKey,
      },
      select: { id: true },
    });
    if (!hasConversationAccess) {
      return corsErrorResponse("Visitor not found", 404);
    }

    const visitorInfo = await prisma.visitorInfo.findUnique({
      where: { visitorId },
      include: {
        conversations: {
          where: { userId: apiKey },
          orderBy: { lastSeen: 'desc' },
          take: 5
        },
        analytics: {
          where: { userId: apiKey },
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

    return corsResponse({ visitorInfo });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Visitor Info API: Error retrieving visitor information", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return corsErrorResponse("Failed to retrieve visitor information", 500);
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from '@/utils/prismaDB';
import { PrismaClient, Prisma } from "@prisma/client";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { query, documentOwnerId, history } = body;

    // Get headers
    const headersList = await headers();
    
    // Get visitor information
    const visitorId = headersList.get("x-visitor-id") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const referrer = headersList.get("referer") || "unknown";

    // Parse user agent
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "unknown";
    const os = parser.getOS().name || "unknown";
    const device = parser.getDevice().type || "desktop";

    // Use userId instead of documentOwnerId for ChatConversation
    const userId = documentOwnerId;

    if (!query || !userId) {
      return NextResponse.json(
        { error: "Query and userId are required" },
        { status: 400 }
      );
    }

    // Create or update chat conversation
    const conversation = await (prisma as any).chatConversation.upsert({
      where: {
        visitorId_userId: {
          visitorId,
          userId,
        },
      },
      update: {
        lastSeen: new Date(),
        totalMessages: {
          increment: 1,
        },
      },
      create: {
        visitorId,
        userId,
        userAgent,
        deviceType: device,
        browser,
        os,
        ipAddress,
        referrer,
        firstSeen: new Date(),
        lastSeen: new Date(),
        totalMessages: 1,
      },
    });

    // Record user message
    const userMessage = await (prisma as any).chatMessage.create({
      data: {
        conversationId: conversation.id,
        content: query,
        role: "user",
      },
    });

    // Query the FastAPI backend
    const fastApiResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/documents/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        document_owner_id: userId,
        history,
      }),
    });

    if (!fastApiResponse.ok) {
      throw new Error('Failed to get response from FastAPI');
    }

    const { answer, sources } = await fastApiResponse.json();

    // Record assistant response
    const assistantMessage = await (prisma as any).chatMessage.create({
      data: {
        conversationId: conversation.id,
        content: answer,
        role: "assistant",
      },
    });

    // Calculate and update average response time
    const responseTime = assistantMessage.createdAt.getTime() - userMessage.createdAt.getTime();
    await (prisma as any).chatConversation.update({
      where: { id: conversation.id },
      data: {
        avgResponseTime: responseTime,
      },
    });

    return NextResponse.json({
      answer,
      sources,
      visitorInfo: {
        visitorId,
        userAgent,
        ipAddress,
        referrer,
        browser,
        os,
        device
      }
    });
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
} 
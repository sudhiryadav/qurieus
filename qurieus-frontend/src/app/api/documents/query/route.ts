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
    const routeStart = performance.now();
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

    const setupEnd = performance.now();
    console.log(`Next.js route setup took: ${(setupEnd - routeStart).toFixed(2)}ms`);

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

    const dbStart = performance.now();
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
    const dbEnd = performance.now();
    console.log(`Next.js DB operations took: ${(dbEnd - dbStart).toFixed(2)}ms`);

    // Query the FastAPI backend
    const fastApiStart = performance.now();
    console.log('Sending request to FastAPI:', {
      url: `${process.env.BACKEND_URL}/api/v1/documents/query`,
      query,
      document_owner_id: userId
    });

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
      const errorText = await fastApiResponse.text();
      console.error('FastAPI Error Response:', {
        status: fastApiResponse.status,
        statusText: fastApiResponse.statusText,
        error: errorText
      });
      throw new Error(`Failed to get response from FastAPI: ${fastApiResponse.status} ${fastApiResponse.statusText}`);
    }

    const fastApiEnd = performance.now();
    console.log(`FastAPI request took: ${(fastApiEnd - fastApiStart).toFixed(2)}ms`);

    console.log('FastAPI response received, setting up stream...');

    // Forward the streaming response directly
    const routeEnd = performance.now();
    console.log(`Total Next.js route processing took: ${(routeEnd - routeStart).toFixed(2)}ms`);

    return new Response(fastApiResponse.body, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
} 
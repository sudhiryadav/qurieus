import { prisma } from '@/utils/prismaDB';
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { UAParser } from "ua-parser-js";
import { cacheGet, cacheSet, generateQueryCacheKey } from '@/utils/redis';
import { AnalyticsService } from '@/services/analytics';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { query, documentOwnerId, visitorId } = body;

    // Get headers
    const headersList = await headers();
    
    // Get visitor information
    const visitorIdHeader = headersList.get("x-visitor-id") || "unknown";
    const effectiveVisitorId = visitorId || visitorIdHeader;
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

    // Check Redis cache first
    const cacheKey = generateQueryCacheKey(query, documentOwnerId);
    console.log(`[Cache] Checking cache for key: ${cacheKey}`);
    console.log(`[Cache] Query: "${query}"`);
    console.log(`[Cache] DocumentOwnerId: ${documentOwnerId}`);
    const cachedResponse = await cacheGet(cacheKey);
    
    if (cachedResponse) {
      console.log(`[Cache] Cache hit for query: ${query}`);
      console.log(`[Cache] Cached response length: ${cachedResponse.length} bytes`);
      
      // Track analytics for cached response
      const responseTime = Date.now() - startTime;
      await AnalyticsService.trackQuery({
        documentId: documentOwnerId,
        query,
        response: cachedResponse,
        responseTime,
        userId: documentOwnerId,
        visitorId: effectiveVisitorId,
        success: true
      });

      return new Response(cachedResponse, {
        headers: {
          'Content-Type': 'application/x-ndjson',
          'Transfer-Encoding': 'chunked',
        },
      });
    }
    console.log(`[Cache] Cache miss for query: ${query}`);

    // Verify user exists before creating chat conversation
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create or update chat conversation
    const conversation = await prisma.chatConversation.upsert({
      where: {
        visitorId_userId: {
          visitorId: effectiveVisitorId,
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
        visitorId: effectiveVisitorId,
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
    const userMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        content: query,
        role: "user",
      },
    });

    // Fetch chat history server-side
    const historyRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/chat/history?visitorId=${effectiveVisitorId}&userId=${userId}&limit=10`);
    let history = [];
    if (historyRes.ok) {
      history = await historyRes.json();
    }

    // Query the FastAPI backend
    const fastApiResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/admin/documents/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        document_owner_id: documentOwnerId,
        history,
      }),
    });

    if (!fastApiResponse.ok) {
      const errorText = await fastApiResponse.text();
      const responseTime = Date.now() - startTime;
      await AnalyticsService.trackQuery({
        documentId: documentOwnerId,
        query,
        response: errorText,
        responseTime,
        userId: documentOwnerId,
        visitorId: effectiveVisitorId,
        success: false,
        error: errorText
      });
      throw new Error(`Failed to get response from FastAPI: ${fastApiResponse.status} ${fastApiResponse.statusText}`);
    }

    // Stream NDJSON, removing only the 'model' field from each chunk
    const ndjsonStream = fastApiResponse.body;
    if (!ndjsonStream) {
      const responseTime = Date.now() - startTime;
      await AnalyticsService.trackQuery({
        documentId: documentOwnerId,
        query,
        response: "No response body from FastAPI",
        responseTime,
        userId: documentOwnerId,
        visitorId: effectiveVisitorId,
        success: false,
        error: "No response body from FastAPI"
      });
      return NextResponse.json(
        { error: "No response body from FastAPI" },
        { status: 500 }
      );
    }

    // First, collect all the data from the stream
    const chunks: string[] = [];
    const reader = ndjsonStream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          delete data.model;
          const processedLine = JSON.stringify(data) + '\n';
          chunks.push(processedLine);
        } catch (e) {
          console.error('[Stream] Error parsing line:', e);
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer);
        delete data.model;
        const processedLine = JSON.stringify(data) + '\n';
        chunks.push(processedLine);
      } catch (e) {
        console.error('[Stream] Error parsing final buffer:', e);
      }
    }

    // Cache the response if we have data
    const responseText = chunks.join('');
    console.log(`[Cache] Caching response for key: ${cacheKey}`);
    console.log(`[Cache] Response length: ${responseText.length} bytes`);
    console.log(`[Cache] Number of chunks: ${chunks.length}`);
    if (chunks.length > 0) {
      console.log(`[Cache] First chunk preview: ${chunks[0].substring(0, 100)}...`);
    }

    if (responseText.length > 0) {
      await cacheSet(cacheKey, responseText, 3600); // Cache for 1 hour
    } else {
      console.error('[Cache] Not caching empty response');
    }

    // Track analytics for successful response
    const responseTime = Date.now() - startTime;
    await AnalyticsService.trackQuery({
      documentId: documentOwnerId,
      query,
      response: responseText,
      responseTime,
      userId: documentOwnerId,
      visitorId: effectiveVisitorId,
      success: true
    });

    // Create a new stream from the collected chunks
    const responseStream = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      }
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error("[Error] Error in /api/admin/documents/query route:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
} 
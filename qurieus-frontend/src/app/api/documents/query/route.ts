import { prisma } from '@/utils/prismaDB';
import { headers } from "next/headers";
import { NextResponse } from 'next/server';
import { UAParser } from "ua-parser-js";

export async function POST(request: Request) {
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
    const fastApiResponse = await fetch(`${process.env.BACKEND_URL}/api/v1/documents/query`, {
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
      throw new Error(`Failed to get response from FastAPI: ${fastApiResponse.status} ${fastApiResponse.statusText}`);
    }

    // Stream NDJSON, removing only the 'model' field from each chunk
    const ndjsonStream = fastApiResponse.body;
    if (!ndjsonStream) {
      return NextResponse.json(
        { error: "No response body from FastAPI" },
        { status: 500 }
      );
    }
    const filteredStream = new ReadableStream({
      async start(controller) {
        const reader = ndjsonStream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              delete data.model;
              controller.enqueue(JSON.stringify(data) + '\n');
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            delete data.model;
            controller.enqueue(JSON.stringify(data) + '\n');
          } catch {}
        }
        controller.close();
      }
    });

    return new Response(filteredStream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error("Error in /api/documents/query route:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
} 
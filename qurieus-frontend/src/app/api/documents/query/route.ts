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

    console.log('FastAPI response received, setting up stream...');

    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let answer = '';
    let sources: any[] = [];

    const stream = new TransformStream({
      async transform(chunk, controller) {
        console.log('Received chunk from FastAPI');
        const text = decoder.decode(chunk);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            console.log('Processing chunk data:', { type: line.includes('{') ? 'chunk' : 'final', length: line.length });
            const data = JSON.parse(line);
            if (data.chunk) {
              answer += data.chunk;
              controller.enqueue(encoder.encode(JSON.stringify({ chunk: data.chunk }) + '\n'));
            } else if (data.final) {
              sources = data.sources;
              controller.enqueue(encoder.encode(JSON.stringify({ final: true, sources }) + '\n'));
            }
          } catch (e) {
            console.error('Error parsing chunk:', e, 'Raw line:', line);
          }
        }
      },
      async flush(controller) {
        console.log('Stream complete, recording response in database');
        // Record assistant response after stream is complete
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
      }
    });

    console.log('Piping FastAPI response to transform stream...');
    // Pipe the FastAPI response through our transform stream
    fastApiResponse.body?.pipeTo(stream.writable);

    console.log('Returning streaming response to client');
    // Return the streaming response
    return new Response(stream.readable, {
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
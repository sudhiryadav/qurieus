import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/utils/prismaDB";
import { cacheGet, cacheSet, generateQueryCacheKey } from "@/utils/redis";
import { errorResponse } from "@/utils/responser";
import { sendEscalationNotificationToUser, sendEscalationNotificationToAgents } from "@/lib/email";
import { handleUserDisconnect } from "@/lib/agentChatRecovery";
import { corsErrorResponse, createOptionsHandler } from "@/utils/cors";

// Handle OPTIONS request for CORS preflight
export const OPTIONS = createOptionsHandler();

// Rate Limiting Setup
const RATE_LIMIT = parseInt(process.env.QUERY_RATE_LIMIT || "100", 10);
const RATE_WINDOW = parseInt(process.env.QUERY_RATE_WINDOW || "60", 10); // seconds
const rateLimitStore: Record<string, { count: number; reset: number }> = {};

function checkAllowed(list: string[] | undefined, value: string) {
  if (!list || list.length === 0) return true;
  return list.some((item) => value.startsWith(item));
}

async function isRateLimited(key: string) {
  const now = Math.floor(Date.now() / 1000);
  if (!rateLimitStore[key] || rateLimitStore[key].reset < now) {
    rateLimitStore[key] = { count: 1, reset: now + RATE_WINDOW };
    return false;
  }
  if (rateLimitStore[key].count >= RATE_LIMIT) {
    return true;
  }
  rateLimitStore[key].count++;
  return false;
}

interface AnalyticsSessionArgs {
  apiKey: string;
  message: string;
  response: string;
  responseTime: number;
  visitorId: string;
  success: boolean;
  error: string | null;
  request: Request;
  startTime: number;
}

async function trackAnalytics({
  apiKey,
  message,
  response,
  responseTime,
  visitorId,
  success,
  error,
  request,
  startTime,
}: AnalyticsSessionArgs) {
  try {
    await prisma.queryAnalytics.create({
      data: {
        userId: apiKey,
        query: message,
        response: response || "",
        responseTime: responseTime || 0,
        visitorId,
        success: success ?? true,
        error: error || null,
      },
    });
    // Update visitor session
    await prisma.visitorSession.upsert({
      where: { id: visitorId },
      create: {
        userId: apiKey,
        visitorId,
        userAgent: request.headers.get("user-agent") || "Unknown",
        ipAddress: request.headers.get("x-forwarded-for") || "Unknown",
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        queries: 1,
      },
      update: {
        endTime: new Date(),
        duration: { increment: Math.floor((Date.now() - startTime) / 1000) },
        queries: { increment: 1 },
      },
    });
  } catch (err) {
    console.error("Error tracking analytics:", err);
  }
}

async function queryWithModal(message: string, userId: string, history: any[], collectionName?: string) {
  const modalUrl = process.env.MODAL_QUERY_DOCUMENTS_URL;
  const modalApiKey = process.env.MODAL_DOT_COM_X_API_KEY;
  
  if (!modalUrl) {
    console.error('❌ [QUERY API] Modal.com query URL not configured');
    throw new Error("Modal.com query URL not configured");
  }
  
  if (!modalApiKey) {
    console.error('❌ [QUERY API] Modal.com API key not configured');
    throw new Error("Modal.com API key not configured");
  }

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': modalApiKey,
  };

  // Add collection header if provided
  if (collectionName) {
    headers['x-collection'] = collectionName;
  }

  const requestBody = {
    query: message,
    user_id: userId,
    history: history || [],
    collection_name: collectionName,
  };

  const response = await fetch(modalUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [QUERY API] Modal.com service error:', {
      status: response.status,
      statusText: response.statusText,
      errorText
    });
    throw new Error(`Modal.com service error: ${response.status} - ${errorText}`);
  }

  return response;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    // Extract headers for restriction checks
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "";
    
    const apiKey = request.headers.get("x-api-key") || "";
    const body = await request.json();
    const { message, visitorId } = body;
    
    logger.info("Document Query API: Processing query request", { 
      apiKey, 
      visitorId, 
      messageLength: message?.length || 0,
      origin,
      referer,
      ip 
    }, { userId });

    if (!message)
      return corsErrorResponse("Message is required", 400);
    if (!apiKey)
      return corsErrorResponse("API Key is required", 400);

    // Rate Limiting
    const rateKey = `rate:${apiKey}:${ip}`;
    if (await isRateLimited(rateKey)) {
      logger.warn("Document Query API: Rate limit exceeded", { apiKey, ip, rateKey }, { userId });
      return corsErrorResponse("Rate limit exceeded", 429);
    }

    // Fetch user and check domain/origin/referrer/ip restrictions
    const user = await prisma.user.findUnique({
      where: { id: apiKey },
      select: {
        id: true,
        allowedOrigins: true,
        allowedReferrers: true,
        allowedIPs: true,
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { 
            planSnapshot: true,
            plan: true
          },
        },
      } as any,
    });

    const userWithSubscription = user
      ? ({ ...user, subscription: (user as any).subscriptions?.[0] || null, subscriptions: undefined } as any)
      : null;

    if (!userWithSubscription)
      return corsErrorResponse({ error: "Invalid API Key", errorCode: "INVALID_API_KEY" }, 404);
    if (!checkAllowed(userWithSubscription.allowedOrigins, origin))
      return corsErrorResponse({ error: "Origin not allowed", errorCode: "ORIGIN_NOT_ALLOWED" }, 403);
    if (!checkAllowed(userWithSubscription.allowedReferrers, referer))
      return corsErrorResponse({ error: "Referrer not allowed", errorCode: "REFERER_NOT_ALLOWED" }, 403);
    if (!checkAllowed(userWithSubscription.allowedIPs, ip))
      return corsErrorResponse({ error: "IP not allowed", errorCode: "IP_NOT_ALLOWED" }, 403);

    // Check if user has a subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: apiKey, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription)
      return corsErrorResponse({ error: "User has no subscription", errorCode: "NO_SUBSCRIPTION" }, 403);

    // Check if number of request is greater than the subscription plan
    const queryCount = await prisma.queryAnalytics.count({
      where: { userId: apiKey, createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) } },
    });
    const plan = userWithSubscription.subscription?.planSnapshot || userWithSubscription.subscription?.plan;
    if (plan?.maxQueriesPerDay && plan.maxQueriesPerDay < queryCount)
      return corsErrorResponse({ error: "Number of requests exceeded", errorCode: "QUERY_LIMIT_EXCEEDED" }, 403);

    // Get chat history and handle visitor ID
    let effectiveVisitorId = visitorId;
    
    if (!effectiveVisitorId) {
      effectiveVisitorId = `temp_${apiKey}_${Date.now()}`;
      
      await prisma.visitorInfo.upsert({
        where: { visitorId: effectiveVisitorId },
        update: {
          lastSeen: new Date(),
          totalVisits: { increment: 1 }
        },
        create: {
          visitorId: effectiveVisitorId,
          firstSeen: new Date(),
          lastSeen: new Date(),
          totalVisits: 1,
          totalQueries: 0,
          isConverted: false
        }
      });
    }
    
    // Get chat history
    const { data: historyResponse } = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/chat/history?visitorId=${effectiveVisitorId}&userId=${apiKey}&limit=10`
    ).then(res => res.json());
    
    const history = historyResponse?.messages || [];

    // Query with Modal.com
    const collectionName = process.env.QDRANT_COLLECTION;
    const modalResponse = await queryWithModal(message, apiKey, history, collectionName);

    if (!modalResponse.ok)
      throw new Error(`HTTP error! status: ${modalResponse.status}`);

    // Create a stream that processes Modal.com chunks
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const processStream = async () => {
          try {
            const reader = modalResponse.body?.getReader();
            if (!reader) {
              throw new Error("No response body reader available");
            }
            
            const decoder = new TextDecoder();
            let chunkCount = 0;
            let fullResponse = "";
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              
              chunkCount++;
              const chunk = decoder.decode(value);
              fullResponse += chunk;
              
              // Forward chunks to client
              controller.enqueue(encoder.encode(chunk));
            }
            
            controller.close();
            
          } catch (error) {
            console.error('❌ [DOCUMENT QUERY API] Error processing stream:', error);
            controller.error(error);
          }
        };
        
        processStream();
      }
    });
    
    // Return the streaming response
    const finalResponse = new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
    return finalResponse;
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Document Query API: Error processing query", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    }, { userId });
    
    console.error("Document query error:", error);
    return corsErrorResponse({ 
      error: "An error occurred while processing your query", 
      errorCode: "QUERY_ERROR"
    }, 500);
  }
}


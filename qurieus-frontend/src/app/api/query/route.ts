import axios from "@/lib/axios";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { cacheGet, cacheSet, generateQueryCacheKey } from "@/utils/redis";
import { errorResponse } from "@/utils/responser";
import { getServerSession } from "next-auth";
import { logger } from "@/lib/logger";

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

async function queryWithModal(message: string, userId: string, history: any[]) {
  const modalApiUrl = process.env.MODAL_QUERY_DOCUMENTS_URL;
  if (!modalApiUrl) {
    throw new Error('Modal.com API URL not configured');
  }

  const response = await fetch(modalApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MODAL_DOT_COM_X_API_KEY || '',
    },
    body: JSON.stringify({
      query: message,
      user_id: userId,
      history: history || [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Modal.com service error: ${response.status} - ${errorText}`);
  }

  return response;
}

async function queryWithBackend(message: string, userId: string, history: any[]) {
  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/admin/documents/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: message,
      document_owner_id: userId,
      history: history || [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend service error: ${response.status} - ${errorText}`);
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

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn("Query API: Unauthorized access attempt", { origin, referer, ip });
      return errorResponse({ error: "Unauthorized", status: 401, errorCode: "UNAUTHORIZED" });
    }

    userId = session.user.id;
    const body = await request.json();
    const { message, documentId: apiKey, visitorId } = body;
    
    logger.info("Query API: Processing query request", { 
      apiKey, 
      visitorId, 
      messageLength: message?.length || 0,
      origin,
      referer,
      ip 
    }, { userId });

    if (!message)
      return errorResponse({ error: "Message is required", status: 400 });
    if (!apiKey)
      return errorResponse({ error: "API Key is required", status: 400 });

    // Rate Limiting
    const rateKey = `rate:${apiKey}:${ip}`;
    if (await isRateLimited(rateKey)) {
      logger.warn("Query API: Rate limit exceeded", { apiKey, ip, rateKey }, { userId });
      return errorResponse({ error: "Rate limit exceeded", status: 429 });
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
          select: { plan: true },
        },
      } as any,
    });

    // Flatten the subscriptions array to a single subscription (if any)
    const userWithSubscription = user
      ? ({ ...user, subscription: (user as any).subscriptions?.[0] || null, subscriptions: undefined } as any)
      : null;

    if (!userWithSubscription)
      return errorResponse({ error: "Invalid API Key", status: 404, errorCode: "INVALID_API_KEY" });
    if (!checkAllowed(userWithSubscription.allowedOrigins, origin))
      return errorResponse({ error: "Origin not allowed", status: 403, errorCode: "ORIGIN_NOT_ALLOWED" });
    if (!checkAllowed(userWithSubscription.allowedReferrers, referer))
      return errorResponse({ error: "Referrer not allowed", status: 403, errorCode: "REFERER_NOT_ALLOWED" });
    if (!checkAllowed(userWithSubscription.allowedIPs, ip))
      return errorResponse({ error: "IP not allowed", status: 403, errorCode: "IP_NOT_ALLOWED" });

    // Check if user has a subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: apiKey, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription)
      return errorResponse({ error: "User has no subscription", status: 403, errorCode: "NO_SUBSCRIPTION" });

    // Check if number of request is greater than the subscription plan
    const queryCount = await prisma.queryAnalytics.count({
      where: { userId: apiKey, createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) } },
    });
    if (userWithSubscription.subscription?.plan.maxQueriesPerDay && userWithSubscription.subscription.plan.maxQueriesPerDay < queryCount)
      return errorResponse({ error: "Number of requests exceeded", status: 403, errorCode: "QUERY_LIMIT_EXCEEDED" });

    // (DEV) Test Response
    if (process.env.NODE_ENV === "development" && false) {
      await trackAnalytics({
        apiKey,
        message,
        response: "This is a test response",
        responseTime: 0,
        visitorId: session?.user.id || "",
        success: true,
        error: null,
        request: request,
        startTime: Date.now(),
      });
      return new Response(
        JSON.stringify({ response: "This is a test response. You have made " + queryCount + " requests today." }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // Query Logic
    const cacheKey = generateQueryCacheKey(message, session.user.id);
    const cachedResponse = await cacheGet(cacheKey);
    // (Cache logic can be re-enabled as needed)

    // Get chat history
    const effectiveVisitorId = visitorId || session.user.id;
    const { data: history } = await axios.get(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/chat/history`,
      {
        params: {
          visitorId: effectiveVisitorId,
          userId: session.user.id,
          limit: 10,
        },
      },
    );

    // Query based on environment configuration
    const useModalPersistent = process.env.USE_MODAL_PERSISTENT_STORAGE === 'true';
    const modalApiUrl = process.env.MODAL_QUERY_DOCUMENTS_URL;

    logger.info("Query API: Executing query", { 
      apiKey, 
      useModalPersistent, 
      hasModalUrl: !!modalApiUrl 
    }, { userId });

    let response;
    if (useModalPersistent && modalApiUrl) {
      // Query with Modal.com
      response = await queryWithModal(message, session.user.id, history);
    } else {
      // Query with backend
      response = await queryWithBackend(message, session.user.id, history);
    }

    if (!response.ok || !response.body)
      throw new Error(`HTTP error! status: ${response.status}`);

    // Create a transform stream to modify the response and cache it
    let responseBuffer = "";
    let success = true;
    let errorMessage: string | null = null;

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        responseBuffer += text;
        controller.enqueue(chunk);
      },
      async flush(controller) {
        try {
          // Cache the response
          await cacheSet(cacheKey, responseBuffer, 3600); // Cache for 1 hour

          // Track analytics
          const responseTime = Date.now() - startTime;
          await trackAnalytics({
            apiKey,
            message,
            response: responseBuffer,
            responseTime,
            visitorId: effectiveVisitorId,
            success,
            error: errorMessage,
            request: request,
            startTime,
          });
        } catch (err) {
          console.error("Error in transform stream flush:", err);
        }
      },
    });

    const responseTime = Date.now() - startTime;
    logger.info("Query API: Query completed successfully", { 
      apiKey, 
      responseTime, 
      responseLength: responseBuffer.length,
      useModalPersistent 
    }, { userId });

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Query API: Error processing query", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    }, { userId });
    
    console.error("Query error:", error);
    return errorResponse({ 
      error: "An error occurred while processing your query", 
      status: 500,
      errorCode: "QUERY_ERROR"
    });
  }
}

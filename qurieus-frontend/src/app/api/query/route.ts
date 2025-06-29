import axios from "@/lib/axios";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { cacheGet, cacheSet, generateQueryCacheKey } from "@/utils/redis";
import { errorResponse } from "@/utils/responser";
import { getServerSession } from "next-auth";

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

export async function POST(request: Request) {
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
      return errorResponse({ error: "Unauthorized", status: 401, errorCode: "UNAUTHORIZED" });
    }

    const body = await request.json();
    const { message, documentId: apiKey, visitorId } = body;
    if (!message)
      return errorResponse({ error: "Message is required", status: 400 });
    if (!apiKey)
      return errorResponse({ error: "API Key is required", status: 400 });

    // Rate Limiting
    const rateKey = `rate:${apiKey}:${ip}`;
    if (await isRateLimited(rateKey))
      return errorResponse({ error: "Rate limit exceeded", status: 429 });

    // Fetch user and check domain/origin/referrer/ip restrictions
    const user = await prisma.user.findUnique({
      where: { id: apiKey },
      select: {
        id: true,
        allowedOrigins: true,
        allowedReferrers: true,
        allowedIPs: true,
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!user)
      return errorResponse({ error: "Invalid API Key", status: 404, errorCode: "INVALID_API_KEY" });
    if (!checkAllowed(user.allowedOrigins, origin))
      return errorResponse({ error: "Origin not allowed", status: 403, errorCode: "ORIGIN_NOT_ALLOWED" });
    if (!checkAllowed(user.allowedReferrers, referer))
      return errorResponse({ error: "Referrer not allowed", status: 403, errorCode: "REFERER_NOT_ALLOWED" });
    if (!checkAllowed(user.allowedIPs, ip))
      return errorResponse({ error: "IP not allowed", status: 403, errorCode: "IP_NOT_ALLOWED" });

    // Check if user has a subscription
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: apiKey },
    });
    if (!subscription)
      return errorResponse({ error: "User has no subscription", status: 403, errorCode: "NO_SUBSCRIPTION" });

    // Check if number of request is greater than the subscription plan
    const queryCount = await prisma.queryAnalytics.count({
      where: { userId: apiKey, createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) } },
    });
    if (user.subscription?.plan.maxQueriesPerDay && user.subscription.plan.maxQueriesPerDay < queryCount)
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
    const startTime = Date.now();

    // Query the backend
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/admin/documents/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.id}`,
        },
        body: JSON.stringify({
          query: message,
          document_owner_id: session.user.id,
          history: history || [],
        }),
      },
    );
    if (!response.ok || !response.body)
      throw new Error(`HTTP error! status: ${response.status}`);

    // Create a transform stream to modify the response and cache it
    let responseBuffer = "";
    let success = true;
    let errorMessage: string | null = null;
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          const text = new TextDecoder().decode(chunk);
          responseBuffer += text;
          const lines = text.split("\n").filter((line) => line.trim());
          for (const line of lines) {
            const data = JSON.parse(line);
            if (data.response === "No relevant documents found.") {
              // Optionally notify user/admin here
              data.response =
                "The system needs to be configured before using it.";
              responseBuffer = "";
            }
            controller.enqueue(
              new TextEncoder().encode(JSON.stringify(data) + "\n"),
            );
          }
        } catch (e) {
          console.error("Error transforming stream:", e);
          success = false;
          errorMessage = e instanceof Error ? e.message : "Unknown error";
          controller.enqueue(chunk);
        }
      },
      async flush(controller) {
        // Only cache if we have a response and it's not a "no documents" case
        if (
          responseBuffer &&
          !responseBuffer.includes('"response":"No relevant documents found."')
        ) {
          cacheSet(cacheKey, responseBuffer, 3600); // Cache for 1 hour
        }
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
          request,
          startTime,
        });
      },
    });

    // Return the transformed response as a stream
    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Error in document query:", error);
    return errorResponse({ error: error.response?.data?.error || "Failed to process query", status: error.response?.status || 500 });
  }
}

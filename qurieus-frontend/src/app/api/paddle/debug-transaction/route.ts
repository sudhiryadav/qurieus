import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { logger } from "@/lib/logger";
import axios from "axios";

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId, checkoutAttemptId } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: "transactionId is required" }, { status: 400 });
    }

    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "PADDLE_API_KEY is not configured" }, { status: 500 });
    }

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://api.paddle.com"
        : "https://sandbox-api.paddle.com";

    logger.info("Paddle Debug Transaction API: fetching transaction", {
      userId: session.user.id,
      checkoutAttemptId: checkoutAttemptId || null,
      transactionId,
      nodeEnv: process.env.NODE_ENV,
      baseUrl,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey.slice(0, 12),
    });

    const response = await axios.get(`${baseUrl}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    const transaction = response.data?.data;
    const elapsedMs = Date.now() - startTime;

    logger.info("Paddle Debug Transaction API: fetched transaction", {
      userId: session.user.id,
      checkoutAttemptId: checkoutAttemptId || null,
      transactionId,
      status: transaction?.status || null,
      origin: transaction?.origin || null,
      customerId: transaction?.customer_id || null,
      subscriptionId: transaction?.subscription_id || null,
      billedAt: transaction?.billed_at || null,
      occurredAt: transaction?.created_at || null,
      elapsedMs,
    });

    return NextResponse.json({
      success: true,
      transaction,
      meta: {
        checkoutAttemptId: checkoutAttemptId || null,
        fetchedAt: new Date().toISOString(),
        elapsedMs,
      },
    });
  } catch (error: any) {
    const elapsedMs = Date.now() - startTime;
    logger.error("Paddle Debug Transaction API: failed to fetch transaction", {
      error: error?.response?.data || error?.message || String(error),
      status: error?.response?.status || null,
      elapsedMs,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch Paddle transaction",
        detail: error?.response?.data || error?.message || String(error),
      },
      { status: error?.response?.status || 500 },
    );
  }
}

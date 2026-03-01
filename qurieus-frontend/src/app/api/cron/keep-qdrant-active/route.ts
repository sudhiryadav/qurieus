/**
 * Cron endpoint: Keep Qdrant Cloud cluster active.
 *
 * Qdrant Cloud free tier clusters are suspended after 1 week of inactivity,
 * and deleted after 4 weeks if not reactivated.
 * See: https://qdrant.tech/documentation/cloud/create-cluster
 *
 * Schedule this endpoint to run every 3-5 days (e.g. via cron-job.org, GitHub Actions,
 * or system crontab calling the standalone script).
 *
 * Auth: Bearer token via Authorization header. Set CRON_SECRET in env.
 */
import { NextRequest, NextResponse } from "next/server";
import { keepQdrantActive } from "@/lib/keepQdrantActive";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && token !== expectedSecret) {
    logger.warn("keep-qdrant-active: Unauthorized cron request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await keepQdrantActive();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Qdrant cluster pinged successfully",
    });
  } catch (error) {
    logger.error("keep-qdrant-active: Unexpected error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

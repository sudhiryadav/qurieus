/**
 * Keep Qdrant Cloud cluster active to prevent auto-suspension.
 *
 * Qdrant Cloud free tier: clusters are suspended after 1 week of inactivity,
 * and deleted after 4 weeks if not reactivated.
 * See: https://qdrant.tech/documentation/cloud/create-cluster
 *
 * This function performs a lightweight GET /collections request to register
 * activity and reset the inactivity timer.
 */
import { getQdrantConfig } from "@/lib/qdrant";
import { logger } from "@/lib/logger";

export async function keepQdrantActive(): Promise<{ success: boolean; error?: string }> {
  const config = getQdrantConfig();

  if (!config.QDRANT_URL) {
    logger.warn("keepQdrantActive: QDRANT_URL not set, skipping");
    return { success: false, error: "QDRANT_URL not configured" };
  }

  if (!config.QDRANT_COLLECTION) {
    logger.warn("keepQdrantActive: QDRANT_COLLECTION not set, skipping");
    return { success: false, error: "QDRANT_COLLECTION not configured" };
  }

  try {
    const url = config.QDRANT_URL.replace(/\/$/, "");
    const collectionsUrl = `${url}/collections/${config.QDRANT_COLLECTION}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.QDRANT_API_KEY) {
      headers["api-key"] = config.QDRANT_API_KEY;
    }

    const response = await fetch(collectionsUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      logger.warn("keepQdrantActive: Qdrant request failed", {
        status: response.status,
        statusText: response.statusText,
        body: text.slice(0, 200),
      });
      return {
        success: false,
        error: `Qdrant returned ${response.status}: ${response.statusText}`,
      };
    }

    logger.info("keepQdrantActive: Qdrant cluster pinged successfully");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("keepQdrantActive: Error pinging Qdrant", { error: message });
    return { success: false, error: message };
  }
}

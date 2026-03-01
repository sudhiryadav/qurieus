#!/usr/bin/env ts-node
/**
 * Standalone script to keep Qdrant Cloud cluster active.
 *
 * Qdrant Cloud free tier: clusters suspend after 1 week of inactivity,
 * deleted after 4 weeks. See: https://qdrant.tech/documentation/cloud/create-cluster
 *
 * Run via system crontab every 3-5 days. Example crontab line:
 *   0 6 * * 0,3,6  (6 AM on Sun/Wed/Sat) or 0 6 1,15 * * (6 AM on 1st and 15th)
 */
import "dotenv/config";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

async function main() {
  if (!QDRANT_URL || !QDRANT_COLLECTION) {
    console.warn(
      "[keepQdrantActive] QDRANT_URL or QDRANT_COLLECTION not set, skipping"
    );
    process.exit(0);
  }

  const url = QDRANT_URL.replace(/\/$/, "");
  const collectionsUrl = `${url}/collections/${QDRANT_COLLECTION}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (QDRANT_API_KEY) {
    headers["api-key"] = QDRANT_API_KEY;
  }

  try {
    const response = await fetch(collectionsUrl, { method: "GET", headers });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[keepQdrantActive] Qdrant request failed: ${response.status} ${response.statusText}`,
        text.slice(0, 200)
      );
      process.exit(1);
    }

    console.log(
      `[keepQdrantActive] Success at ${new Date().toISOString()} - Qdrant cluster pinged`
    );
    process.exit(0);
  } catch (error) {
    console.error(
      "[keepQdrantActive] Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main();

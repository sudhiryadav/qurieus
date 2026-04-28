#!/usr/bin/env ts-node
/**
 * Standalone script to keep Qdrant Cloud cluster active.
 *
 * Qdrant Cloud free tier: clusters suspend after 1 week of inactivity,
 * deleted after 4 weeks. See: https://qdrant.tech/documentation/cloud/create-cluster
 *
 * Run via system crontab daily. Example crontab line:
 *   0 6 * * *  (6 AM every day)
 */
import "dotenv/config";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

async function main() {
  if (!QDRANT_URL || !QDRANT_COLLECTION) {
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
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

main();

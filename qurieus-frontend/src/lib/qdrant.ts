// @ts-ignore: No type declarations for @qdrant/js-client-rest
import { QdrantClient } from "@qdrant/js-client-rest";

// Get environment variables directly
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

// Debug: Log Qdrant configuration

// Initialize Qdrant client with API key if available
export const qdrant = new QdrantClient({ 
  url: QDRANT_URL, 
  checkCompatibility: false,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY })
});

// Export as a function to get fresh values
export function getQdrantConfig() {
  return {
    QDRANT_URL: process.env.QDRANT_URL,
    QDRANT_COLLECTION: process.env.QDRANT_COLLECTION,
    QDRANT_API_KEY: process.env.QDRANT_API_KEY
  };
}

export default qdrant;

import { Redis } from 'ioredis';

// Create Redis client with environment-specific configuration
const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log(`[Redis] Initializing client with URL: ${redisUrl}`);
  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    connectTimeout: 10000,
    enableReadyCheck: true,
  });
};

// Initialize Redis client
let redisClient: Redis | null = null;

// Get Redis client instance (singleton pattern)
export const getRedis = () => {
  if (!redisClient) {
    redisClient = getRedisClient();
    
    // Add event listeners for debugging
    redisClient.on('connect', () => {
      console.log('[Redis] Client connected');
    });
    
    redisClient.on('error', (error) => {
      console.error('[Redis] Client error:', error);
    });
    
    redisClient.on('ready', () => {
      console.log('[Redis] Client ready');
    });
  }
  return redisClient;
};

// Cache helper functions
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const redis = getRedis();
    console.log(`[Redis] Getting cache for key: ${key}`);
    const value = await redis.get(key);
    if (value) {
      console.log(`[Redis] Cache hit for key: ${key}`);
      console.log(`[Redis] Value length: ${value.length} bytes`);
    } else {
      console.log(`[Redis] Cache miss for key: ${key}`);
    }
    return value;
  } catch (error) {
    console.error('[Redis] Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (key: string, value: string, expirySeconds: number = 3600): Promise<void> => {
  try {
    const redis = getRedis();
    console.log(`[Redis] Setting cache for key: ${key}`);
    console.log(`[Redis] Value length: ${value.length} bytes`);
    console.log(`[Redis] Expiry: ${expirySeconds} seconds`);
    await redis.setex(key, expirySeconds, value);
    console.log(`[Redis] Cache set successfully for key: ${key}`);
  } catch (error) {
    console.error('[Redis] Cache set error:', error);
  }
};

// Generate cache key for queries
export const generateQueryCacheKey = (query: string, documentOwnerId: string): string => {
  // Normalize the query by trimming and converting to lowercase
  const normalizedQuery = query.trim().toLowerCase();
  return `query:${documentOwnerId}:${normalizedQuery}`;
}; 
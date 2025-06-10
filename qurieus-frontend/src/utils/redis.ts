import { Redis } from 'ioredis';

// Create Redis client with environment-specific configuration
const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  return new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
};

// Initialize Redis client
let redisClient: Redis | null = null;

// Get Redis client instance (singleton pattern)
export const getRedis = () => {
  if (!redisClient) {
    redisClient = getRedisClient();
  }
  return redisClient;
};

// Cache helper functions
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const redis = getRedis();
    return await redis.get(key);
  } catch (error) {
    console.error('Redis cache get error:', error);
    return null;
  }
};

export const cacheSet = async (key: string, value: string, expirySeconds: number = 3600): Promise<void> => {
  try {
    const redis = getRedis();
    await redis.setex(key, expirySeconds, value);
  } catch (error) {
    console.error('Redis cache set error:', error);
  }
};

// Generate cache key for queries
export const generateQueryCacheKey = (query: string, documentOwnerId: string): string => {
  return `query:${documentOwnerId}:${query}`;
}; 
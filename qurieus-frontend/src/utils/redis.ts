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
    connectTimeout: 10000,
    enableReadyCheck: true,
  });
};

// Initialize Redis client
let redisClient: Redis | null = null;
let instanceId = 0;

// Get Redis client instance (singleton pattern)
export const getRedis = () => {
  if (!redisClient) {
    instanceId++;
    redisClient = getRedisClient();
    
    // Add event listeners for debugging
    redisClient.on('connect', () => {
    });
    
    redisClient.on('error', (error) => {
    });
    
    redisClient.on('ready', () => {
    });
  } else {
  }
  return redisClient;
};

// Cache helper functions
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const redis = getRedis();
    const value = await redis.get(key);
    if (value) {
    } else {
    }
    return value;
  } catch (error) {
    return null;
  }
};

export const cacheSet = async (key: string, value: string, expirySeconds: number = 3600): Promise<void> => {
  try {
    const redis = getRedis();
    await redis.setex(key, expirySeconds, value);
  } catch (error) {
  }
};

// Generate cache key for queries
export const generateQueryCacheKey = (query: string, documentOwnerId: string): string => {
  // Normalize the query by trimming and converting to lowercase
  const normalizedQuery = query.trim().toLowerCase();
  return `query:${documentOwnerId}:${normalizedQuery}`;
}; 
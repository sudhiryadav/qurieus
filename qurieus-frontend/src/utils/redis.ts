import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL?.trim();
const redisEnabled = Boolean(redisUrl);

let redisClient: Redis | null = null;

const getRedisClient = () => {
  return new Redis(redisUrl as string, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 50, 2000);
    },
    connectTimeout: 5000,
    enableReadyCheck: true,
    lazyConnect: true,
  });
};

export const getRedis = (): Redis | null => {
  if (!redisEnabled) {
    return null;
  }
  if (!redisClient) {
    redisClient = getRedisClient();
    redisClient.on('error', () => {});
  }
  return redisClient;
};

export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const redis = getRedis();
    if (!redis) return null;
    if (redis.status === 'wait') {
      await redis.connect();
    }
    return await redis.get(key);
  } catch {
    return null;
  }
};

export const cacheSet = async (key: string, value: string, expirySeconds: number = 3600): Promise<void> => {
  try {
    const redis = getRedis();
    if (!redis) return;
    if (redis.status === 'wait') {
      await redis.connect();
    }
    await redis.setex(key, expirySeconds, value);
  } catch {
    // Cache is optional on Cloud Run (no Memorystore on free tier).
  }
};

export const generateQueryCacheKey = (query: string, documentOwnerId: string): string => {
  const normalizedQuery = query.trim().toLowerCase();
  return `query:${documentOwnerId}:${normalizedQuery}`;
};

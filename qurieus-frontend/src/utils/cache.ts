import Redis from 'ioredis';
import { logger } from "@/lib/logger";

class RedisClient {
  private static instance: RedisClient;
  private redis: Redis;

  private constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  public async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  public async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  public async del(...keys: string[]): Promise<void> {
    await this.redis.del(...keys);
  }
}

const redisClient = RedisClient.getInstance();

export async function cacheGet(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error('Error getting from cache', error);
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
  try {
    await redisClient.set(key, value, ttlSeconds);
  } catch (error) {
    logger.error('Error setting cache', error);
  }
}

export function generateQueryCacheKey(query: string, userId: string): string {
  return `query:${userId}:${query}`;
}

export async function invalidateAnalyticsCache(userId: string) {
  try {
    const keys = await redisClient.keys(`analytics:${userId}:*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    logger.error('Error invalidating analytics cache', error);
  }
} 
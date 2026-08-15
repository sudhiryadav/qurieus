import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL?.trim();
const redisHost = process.env.REDIS_HOST;
const redisEnabled = Boolean(redisUrl || redisHost);

class RedisClient {
  private static instance: RedisClient;
  private redis: Redis | null = null;

  private constructor() {
    if (!redisEnabled) {
      return;
    }
    this.redis = redisUrl
      ? new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          retryStrategy: (times) => (times > 3 ? null : Math.min(times * 50, 2000)),
        })
      : new Redis({
          host: redisHost || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          retryStrategy: (times) => (times > 3 ? null : Math.min(times * 50, 2000)),
        });
    this.redis.on('error', () => {});
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async get(key: string): Promise<string | null> {
    if (!this.redis) return null;
    if (this.redis.status === 'wait') await this.redis.connect();
    return await this.redis.get(key);
  }

  public async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    if (!this.redis) return;
    if (this.redis.status === 'wait') await this.redis.connect();
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  public async keys(pattern: string): Promise<string[]> {
    if (!this.redis) return [];
    if (this.redis.status === 'wait') await this.redis.connect();
    return await this.redis.keys(pattern);
  }

  public async del(...keys: string[]): Promise<void> {
    if (!this.redis || keys.length === 0) return;
    if (this.redis.status === 'wait') await this.redis.connect();
    await this.redis.del(...keys);
  }
}

const redisClient = RedisClient.getInstance();

export async function cacheGet(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
  try {
    await redisClient.set(key, value, ttlSeconds);
  } catch {
    // Cache is optional on Cloud Run.
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
  } catch {
    // Cache is optional on Cloud Run.
  }
}

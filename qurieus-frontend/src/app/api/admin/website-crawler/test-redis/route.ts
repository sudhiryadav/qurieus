import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/utils/redis';

export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    
    // Test basic Redis operations
    const testKey = 'test:crawl:connection';
    const testValue = { timestamp: new Date().toISOString(), test: true };
    
    // Write test data
    await redis.set(testKey, JSON.stringify(testValue));
    console.log('Test data written to Redis');
    
    // Read test data
    const stored = await redis.get(testKey);
    const parsed = stored ? JSON.parse(stored) : null;
    console.log('Test data read from Redis:', parsed);
    
    // Test crawl jobs key
    const crawlJobs = await redis.get('crawlJobs');
    console.log('Crawl jobs in Redis:', crawlJobs ? JSON.parse(crawlJobs) : 'none');
    
    return NextResponse.json({
      success: true,
      testData: parsed,
      crawlJobs: crawlJobs ? JSON.parse(crawlJobs) : null,
      redisInfo: {
        host: redis.options.host,
        port: redis.options.port,
        status: redis.status
      }
    });
    
  } catch (error) {
    console.error('Redis test error:', error);
    return NextResponse.json(
      { error: 'Redis test failed', details: error },
      { status: 500 }
    );
  }
} 
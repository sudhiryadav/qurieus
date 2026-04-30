import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/utils/redis';
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (request: NextRequest) => {
  try {
    const redis = getRedis();
    
    // Test basic Redis operations
    const testKey = 'test:crawl:connection';
    const testValue = { timestamp: new Date().toISOString(), test: true };
    
    // Write test data
    await redis.set(testKey, JSON.stringify(testValue));
    
    // Read test data
    const stored = await redis.get(testKey);
    const parsed = stored ? JSON.parse(stored) : null;
    
    // Test crawl jobs key
    const crawlJobs = await redis.get('crawlJobs');
    
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
    return NextResponse.json(
      { error: 'Redis test failed', details: error },
      { status: 500 }
    );
  }
});
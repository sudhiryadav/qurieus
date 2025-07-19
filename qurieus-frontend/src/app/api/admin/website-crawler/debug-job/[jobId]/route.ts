import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/utils/redis';
import { crawlJobManager } from '@/lib/crawlJobs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const redis = getRedis();
    
    console.log(`[Debug] Testing job ${jobId}`);
    
    // Test 1: Direct Redis read
    const crawlJobsData = await redis.get('crawlJobs');
    const allJobs = crawlJobsData ? JSON.parse(crawlJobsData) : {};
    const jobInRedis = allJobs[jobId];
    
    console.log(`[Debug] Job ${jobId} in Redis:`, jobInRedis);
    
    // Test 2: CrawlJobManager read
    const jobInManager = await crawlJobManager.getJob(jobId);
    
    console.log(`[Debug] Job ${jobId} in Manager:`, jobInManager);
    
    // Test 3: Force reload and check again
    await crawlJobManager['initialize']();
    const jobAfterReload = await crawlJobManager.getJob(jobId);
    
    console.log(`[Debug] Job ${jobId} after reload:`, jobAfterReload);
    
    // Test 4: Write a test value and read it back
    const testKey = `test:job:${jobId}`;
    const testValue = { 
      jobId, 
      timestamp: new Date().toISOString(), 
      test: true,
      pages: jobInRedis?.crawledPages || 0
    };
    
    await redis.set(testKey, JSON.stringify(testValue));
    const testRead = await redis.get(testKey);
    const testParsed = testRead ? JSON.parse(testRead) : null;
    
    console.log(`[Debug] Test write/read for job ${jobId}:`, testParsed);
    
    return NextResponse.json({
      jobId,
      redis: {
        allJobs: Object.keys(allJobs),
        jobData: jobInRedis
      },
      manager: {
        jobData: jobInManager
      },
      afterReload: {
        jobData: jobAfterReload
      },
      testWriteRead: {
        written: testValue,
        read: testParsed
      },
      redisInfo: {
        host: redis.options.host,
        port: redis.options.port,
        status: redis.status
      }
    });
    
  } catch (error) {
    console.error('Debug job error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error },
      { status: 500 }
    );
  }
} 
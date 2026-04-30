import { NextRequest, NextResponse } from 'next/server';
import { crawlJobManager } from '@/lib/crawlJobs';
import { WebsiteCrawler } from '@/lib/websiteCrawler';
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

interface CrawlSettings {
  maxDepth: number;
  maxPages: number;
  includeImages: boolean;
  includeLinks: boolean;
  respectRobotsTxt: boolean;
  delay: number;
  usePuppeteer: boolean;
  extractMainContent: boolean;
}

const PRIVATE_IPV4_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./
];

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (
    normalized === 'localhost' ||
    normalized === '::1' ||
    normalized.endsWith('.local') ||
    normalized.endsWith('.internal')
  ) {
    return true;
  }

  return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(normalized));
}

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (request: NextRequest) => {
  try {
    const { url, settings: partialSettings } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
    }

    if (isBlockedHostname(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: 'Local/private network URLs are not allowed' },
        { status: 400 }
      );
    }
    
    // Merge with default settings
    const settings: CrawlSettings = {
      maxDepth: 3,
      maxPages: 50,
      includeImages: false,
      includeLinks: true,
      respectRobotsTxt: true,
      delay: 1000,
      usePuppeteer: true,
      extractMainContent: true,
      ...partialSettings
    };
    
    // Create a new crawl job
    const job = await crawlJobManager.createJob(url, settings.maxPages);
    
    
    // Start crawling in background
    (async () => {
      try {
        const crawler = new WebsiteCrawler(settings, job.id);
        const results = await crawler.crawl(url);
        
        // Combine all content
        let combinedContent = "";
        for (const result of results) {
          if (result.title) {
            combinedContent += `# ${result.title}\n\n`;
          }
          if (result.text) {
            combinedContent += `${result.text}\n\n`;
          }
          combinedContent += `Source: ${result.url}\n\n---\n\n`;
        }
        
        // Update job status
        await crawlJobManager.updateJob(job.id, {
          status: 'completed',
          extractedContent: combinedContent,
          completedAt: new Date().toISOString(),
          crawledPages: results.length
        });
        
        
      } catch (error) {
        
        // Update job status
        await crawlJobManager.updateJob(job.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date().toISOString()
        });
      }
    })();
    
    // Return job info immediately
    return NextResponse.json({
      jobId: job.id,
      url,
      settings,
      message: 'Crawl started successfully'
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start crawl' },
      { status: 500 }
    );
  }
});
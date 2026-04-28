import { NextRequest, NextResponse } from 'next/server';
import { crawlJobManager } from '@/lib/crawlJobs';
import { WebsiteCrawler } from '@/lib/websiteCrawler';

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

export async function POST(request: NextRequest) {
  try {
    const { url, settings: partialSettings } = await request.json();
    
    
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
} 
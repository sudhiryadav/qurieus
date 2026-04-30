import { NextRequest } from 'next/server';
import { crawlJobManager } from '@/lib/crawlJobs';
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) => {
  const { jobId } = await params;
  
  
  try {
    // Verify job exists before starting stream
    const initialJob = await crawlJobManager.getJob(jobId);
    if (!initialJob) {
      return new Response('Job not found', { status: 404 });
    }
    
    // Set up SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        let lastLogCount = 0;
        let lastCrawledPages = initialJob.crawledPages;
        let consecutiveNotFound = 0;
        
        
        // Function to send logs
        const sendLogs = async () => {
          try {
            // Check if controller is still open
            if (controller.desiredSize === null) {
              return;
            }

            const logs = await crawlJobManager.getLogs(jobId);
            if (logs.length > lastLogCount) {
              // Send only new logs
              const newLogs = logs.slice(lastLogCount);
              for (const log of newLogs) {
                const logData = JSON.stringify({
                  type: 'log',
                  message: log.message,
                  logType: log.type, // Backend has 'type', frontend expects 'logType'
                  url: log.url,
                  timestamp: log.timestamp
                });
                controller.enqueue(encoder.encode(`data: ${logData}\n\n`));
              }
              lastLogCount = logs.length;
            }
          } catch (error) {
            // If there's an error with the controller, close the stream
            if (error instanceof Error && (error.message?.includes('Controller is already closed') || (error as any).code === 'ERR_INVALID_STATE')) {
              clearInterval(interval);
              return;
            }
          }
        };
        
        // Function to send job status
        const sendStatus = async () => {
          try {
            // Check if controller is still open
            if (controller.desiredSize === null) {
              return;
            }

            const job = await crawlJobManager.getJob(jobId);
            if (job) {
              consecutiveNotFound = 0; // Reset counter
              
              
              // Send progress as a log if pages have changed
              if (job.crawledPages > lastCrawledPages) {
                const progressLogData = JSON.stringify({
                  type: 'log',
                  message: `Progress: ${job.crawledPages}/${job.totalPages} pages crawled (${Math.round((job.crawledPages / job.totalPages) * 100)}%)`,
                  logType: 'info',
                  timestamp: new Date().toISOString()
                });
                controller.enqueue(encoder.encode(`data: ${progressLogData}\n\n`));
                lastCrawledPages = job.crawledPages;
              }
              
              const statusData = JSON.stringify({
                type: 'status',
                status: job.status,
                current: job.crawledPages,
                total: job.totalPages,
                percentage: Math.round((job.crawledPages / job.totalPages) * 100)
              });
              controller.enqueue(encoder.encode(`data: ${statusData}\n\n`));
              
              // If job is completed or failed, close the stream
              if (job.status === 'completed' || job.status === 'failed') {
                const completionData = JSON.stringify({
                  type: 'completed',
                  jobId,
                  status: job.status,
                  results: job.crawledPages,
                  error: job.error
                });
                controller.enqueue(encoder.encode(`data: ${completionData}\n\n`));
                controller.close();
                clearInterval(interval); // Clear the interval
                return;
              }
            } else {
              consecutiveNotFound++;
              
              // If job is consistently not found, close the stream
              if (consecutiveNotFound >= 10) {
                const errorData = JSON.stringify({
                  type: 'log',
                  message: `Error: Job not found in database after ${consecutiveNotFound} attempts`,
                  logType: 'error',
                  timestamp: new Date().toISOString()
                });
                controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                controller.close();
                clearInterval(interval); // Clear the interval
                return;
              }
            }
          } catch (error) {
            // If there's an error with the controller, close the stream
            if (error instanceof Error && (error.message?.includes('Controller is already closed') || (error as any).code === 'ERR_INVALID_STATE')) {
              clearInterval(interval);
              return;
            }
          }
        };
        
        // Send initial status
        sendStatus();
        
        // Poll for updates every 500ms
        const interval = setInterval(async () => {
          try {
            await sendLogs();
            await sendStatus();
          } catch (error) {
            clearInterval(interval);
            controller.close();
          }
        }, 500);
        
        // Clean up interval when stream is closed
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
    
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
});
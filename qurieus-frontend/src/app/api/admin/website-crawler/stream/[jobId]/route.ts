import { NextRequest } from 'next/server';
import { crawlJobManager } from '@/lib/crawlJobs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  
  console.log(`[SSE] Starting stream for job: ${jobId}`);
  
  try {
    // Verify job exists before starting stream
    const initialJob = await crawlJobManager.getJob(jobId);
    if (!initialJob) {
      console.error(`[SSE] Job ${jobId} not found in initial lookup`);
      return new Response('Job not found', { status: 404 });
    }
    console.log(`[SSE] Job ${jobId} found, status: ${initialJob.status}, pages: ${initialJob.crawledPages}/${initialJob.totalPages}`);
    
    // Set up SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        let lastLogCount = 0;
        let lastCrawledPages = initialJob.crawledPages;
        let consecutiveNotFound = 0;
        
        console.log(`[SSE] Stream started for job: ${jobId}, initial pages: ${lastCrawledPages}`);
        
        // Function to send logs
        const sendLogs = async () => {
          try {
            // Check if controller is still open
            if (controller.desiredSize === null) {
              console.log(`[SSE] Controller closed, stopping log updates for job: ${jobId}`);
              return;
            }

            const logs = await crawlJobManager.getLogs(jobId);
            if (logs.length > lastLogCount) {
              // Send only new logs
              const newLogs = logs.slice(lastLogCount);
              console.log(`[SSE] Sending ${newLogs.length} new logs for job: ${jobId}`);
              for (const log of newLogs) {
                console.log(`[SSE] Sending log:`, log);
                console.log(`[SSE] Log type:`, typeof log.type, log.type);
                console.log(`[SSE] Log message:`, typeof log.message, log.message);
                const logData = JSON.stringify({
                  type: 'log',
                  message: log.message,
                  logType: log.type, // Backend has 'type', frontend expects 'logType'
                  url: log.url,
                  timestamp: log.timestamp
                });
                console.log(`[SSE] Log data being sent:`, logData);
                controller.enqueue(encoder.encode(`data: ${logData}\n\n`));
              }
              lastLogCount = logs.length;
            }
          } catch (error) {
            console.error('Error sending logs:', error);
            // If there's an error with the controller, close the stream
            if (error instanceof Error && (error.message?.includes('Controller is already closed') || (error as any).code === 'ERR_INVALID_STATE')) {
              console.log(`[SSE] Controller error detected in sendLogs, closing stream for job: ${jobId}`);
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
              console.log(`[SSE] Controller closed, stopping status updates for job: ${jobId}`);
              return;
            }

            const job = await crawlJobManager.getJob(jobId);
            if (job) {
              consecutiveNotFound = 0; // Reset counter
              
              console.log(`[SSE] Job ${jobId} status check: current=${job.crawledPages}, last=${lastCrawledPages}, changed=${job.crawledPages > lastCrawledPages}`);
              
              // Send progress as a log if pages have changed
              if (job.crawledPages > lastCrawledPages) {
                console.log(`[SSE] Progress update for job ${jobId}: ${lastCrawledPages} -> ${job.crawledPages}`);
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
                console.log(`[SSE] Job ${jobId} completed with status: ${job.status}`);
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
              console.warn(`[SSE] Job ${jobId} not found (attempt ${consecutiveNotFound})`);
              
              // If job is consistently not found, close the stream
              if (consecutiveNotFound >= 10) {
                console.error(`[SSE] Job ${jobId} consistently not found, closing stream`);
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
            console.error('Error sending status:', error);
            // If there's an error with the controller, close the stream
            if (error instanceof Error && (error.message?.includes('Controller is already closed') || (error as any).code === 'ERR_INVALID_STATE')) {
              console.log(`[SSE] Controller error detected, closing stream for job: ${jobId}`);
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
            console.error('Error in SSE polling:', error);
            clearInterval(interval);
            controller.close();
          }
        }, 500);
        
        // Clean up interval when stream is closed
        request.signal.addEventListener('abort', () => {
          console.log(`[SSE] Stream aborted for job: ${jobId}`);
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
    
  } catch (error) {
    console.error('Error in SSE stream:', error);
    return new Response('Error', { status: 500 });
  }
} 
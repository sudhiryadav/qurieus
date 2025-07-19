// Shared storage for crawl jobs across API routes
// Using Redis for persistent storage

import { getRedis } from '@/utils/redis';

interface CrawlLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  url?: string;
}

interface CrawlJob {
  id: string;
  baseUrl: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  totalPages: number;
  crawledPages: number;
  extractedContent: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  logs: CrawlLog[];
}

class CrawlJobManager {
  private redisKey = 'crawlJobs';
  private redisInstance: any = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Get Redis instance and store it
      this.redisInstance = getRedis();
      console.log(`[CrawlJobManager] Using Redis instance:`, this.redisInstance.options.host, this.redisInstance.options.port);
    } catch (error) {
      console.warn('Failed to initialize Redis:', error);
    }
  }

  private async getRedisInstance(): Promise<any> {
    if (!this.redisInstance) {
      await this.initialize();
    }
    return this.redisInstance;
  }

  private async loadJobsFromRedis(): Promise<Map<string, CrawlJob>> {
    try {
      const redis = await this.getRedisInstance();
      if (!redis) {
        console.error('Redis instance not available');
        return new Map();
      }
      
      console.log(`Loading jobs from Redis key: ${this.redisKey}`);
      const stored = await redis.get(this.redisKey);
      if (stored) {
        const jobs = JSON.parse(stored);
        const jobsMap = new Map(Object.entries(jobs)) as Map<string, CrawlJob>;
        console.log(`Loaded ${jobsMap.size} jobs from Redis`);
        console.log(`Job IDs loaded:`, Array.from(jobsMap.keys()));
        return jobsMap;
      } else {
        console.log(`No jobs found in Redis for key: ${this.redisKey}`);
        return new Map();
      }
    } catch (error) {
      console.warn('Failed to load crawl jobs from Redis:', error);
      return new Map();
    }
  }

  private async saveJobsToRedis(jobs: Map<string, CrawlJob>): Promise<void> {
    try {
      const redis = await this.getRedisInstance();
      if (!redis) {
        console.error('Redis instance not available');
        return;
      }
      const jobsObject = Object.fromEntries(jobs);
      const jobsJson = JSON.stringify(jobsObject);
      console.log(`Saving ${jobs.size} jobs to Redis, data size: ${jobsJson.length} bytes`);
      await redis.set(this.redisKey, jobsJson);
      console.log(`Successfully saved jobs to Redis`);
    } catch (error) {
      console.warn('Failed to save crawl jobs to Redis:', error);
    }
  }

  async createJob(url: string, totalPages: number = 50): Promise<CrawlJob> {
    const job: CrawlJob = {
      id: crypto.randomUUID(),
      baseUrl: url, // Assuming baseUrl is the same as url for now
      status: 'pending',
      totalPages,
      crawledPages: 0,
      extractedContent: '',
      logs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`Creating new job ${job.id} for URL: ${url}`);
    
    // Load current jobs from Redis
    const jobs = await this.loadJobsFromRedis();
    
    // Add new job
    jobs.set(job.id, job);
    
    // Save back to Redis
    await this.saveJobsToRedis(jobs);
    
    console.log(`Job ${job.id} created and saved to Redis`);
    return job;
  }

  async getJob(jobId: string): Promise<CrawlJob | null> {
    try {
      console.log(`Looking up job ${jobId}: starting Redis lookup`);
      
      // Always read from Redis (stateless)
      const jobs = await this.loadJobsFromRedis();
      const job = jobs.get(jobId);
      
      if (job) {
        console.log(`Job ${jobId} details: status=${job.status}, pages=${job.crawledPages}/${job.totalPages}`);
        return job;
      } else {
        console.log(`Job ${jobId} not found in Redis`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting job ${jobId}:`, error);
      return null;
    }
  }

  async updateJob(jobId: string, updates: Partial<CrawlJob>): Promise<void> {
    try {
      console.log(`About to save job ${jobId} to Redis with ${updates.crawledPages} pages`);
      
      // Load current jobs from Redis
      const jobs = await this.loadJobsFromRedis();
      const job = jobs.get(jobId);
      
      if (!job) {
        console.warn(`Job ${jobId} not found for update`);
        return;
      }

      // Update the job
      const updatedJob = { ...job, ...updates, updatedAt: new Date().toISOString() };
      jobs.set(jobId, updatedJob);
      
      console.log(`Updated job ${jobId}:`, { crawledPages: updatedJob.crawledPages, totalPages: updatedJob.totalPages });
      console.log(`Job ${jobId} now has ${updatedJob.crawledPages}/${updatedJob.totalPages} pages`);
      
      // Save back to Redis
      await this.saveJobsToRedis(jobs);
      
      // Verify the save worked by reading it back
      const verificationJobs = await this.loadJobsFromRedis();
      const verificationJob = verificationJobs.get(jobId);
      console.log(`Verification: Job ${jobId} in Redis has ${verificationJob?.crawledPages} pages`);
      
    } catch (error) {
      console.error(`Error updating job ${jobId}:`, error);
    }
  }

  async addLog(jobId: string, message: string, logType: 'info' | 'success' | 'error' | 'warning' = 'info'): Promise<void> {
    try {
      // Load current jobs from Redis
      const jobs = await this.loadJobsFromRedis();
      const job = jobs.get(jobId);
      
      if (!job) {
        console.warn(`Job ${jobId} not found for log addition`);
        return;
      }

      // Ensure message is a string
      const messageStr = typeof message === 'string' ? message : String(message);
      console.log(`[CrawlJobManager] Adding log for job ${jobId}:`, { message: messageStr, type: logType });

      const log = {
        message: messageStr,
        type: logType,
        timestamp: new Date().toISOString()
      };

      const updatedJob = {
        ...job,
        logs: [...job.logs, log],
        updatedAt: new Date().toISOString()
      };

      jobs.set(jobId, updatedJob);
      
      // Save back to Redis
      await this.saveJobsToRedis(jobs);
      
    } catch (error) {
      console.error(`Error adding log to job ${jobId}:`, error);
    }
  }

  async getLogs(jobId: string): Promise<CrawlLog[]> {
    try {
      const jobs = await this.loadJobsFromRedis();
      const job = jobs.get(jobId);
      return job?.logs || [];
    } catch (error) {
      console.error('Error getting logs for job:', error);
      return [];
    }
  }

  async getAllJobs(): Promise<CrawlJob[]> {
    try {
      const jobs = await this.loadJobsFromRedis();
      return Array.from(jobs.values());
    } catch (error) {
      console.error('Error getting all jobs:', error);
      return [];
    }
  }

  async deleteJob(jobId: string): Promise<boolean> {
    try {
      const jobs = await this.loadJobsFromRedis();
      const deleted = jobs.delete(jobId);
      if (deleted) {
        await this.saveJobsToRedis(jobs);
      }
      return deleted;
    } catch (error) {
      console.error(`Error deleting job ${jobId}:`, error);
      return false;
    }
  }

  // Clean up old completed jobs (older than 24 hours)
  async cleanupOldJobs(): Promise<void> {
    try {
      const jobs = await this.loadJobsFromRedis();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      let cleanedCount = 0;
      Array.from(jobs.entries()).forEach(([jobId, job]) => {
        if (job.status === 'completed' && job.completedAt) {
          const completedAt = new Date(job.completedAt);
          if (completedAt < oneDayAgo) {
            jobs.delete(jobId);
            cleanedCount++;
          }
        }
      });
      
      if (cleanedCount > 0) {
        await this.saveJobsToRedis(jobs);
        console.log(`Cleaned up ${cleanedCount} old jobs`);
      }
    } catch (error) {
      console.error('Error cleaning up old jobs:', error);
    }
  }

  // Debug method to list all jobs
  async debugJobs(): Promise<void> {
    try {
      const jobs = await this.loadJobsFromRedis();
      console.log('=== Crawl Jobs Debug ===');
      console.log(`Total jobs: ${jobs.size}`);
      Array.from(jobs.entries()).forEach(([id, job]) => {
        console.log(`Job ${id}: ${job.status} - ${job.baseUrl}`);
      });
      console.log('========================');
    } catch (error) {
      console.error('Error debugging jobs:', error);
    }
  }
}

// Export a singleton instance
export const crawlJobManager = new CrawlJobManager();
export type { CrawlJob, CrawlLog }; 
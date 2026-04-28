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
    } catch (error) {
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
        return new Map();
      }
      
      const stored = await redis.get(this.redisKey);
      if (stored) {
        const jobs = JSON.parse(stored);
        const jobsMap = new Map(Object.entries(jobs)) as Map<string, CrawlJob>;
        return jobsMap;
      } else {
        return new Map();
      }
    } catch (error) {
      return new Map();
    }
  }

  private async saveJobsToRedis(jobs: Map<string, CrawlJob>): Promise<void> {
    try {
      const redis = await this.getRedisInstance();
      if (!redis) {
        return;
      }
      const jobsObject = Object.fromEntries(jobs);
      const jobsJson = JSON.stringify(jobsObject);
      await redis.set(this.redisKey, jobsJson);
    } catch (error) {
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

    
    // Load current jobs from Redis
    const jobs = await this.loadJobsFromRedis();
    
    // Add new job
    jobs.set(job.id, job);
    
    // Save back to Redis
    await this.saveJobsToRedis(jobs);
    
    return job;
  }

  async getJob(jobId: string): Promise<CrawlJob | null> {
    try {
      
      // Always read from Redis (stateless)
      const jobs = await this.loadJobsFromRedis();
      const job = jobs.get(jobId);
      
      if (job) {
        return job;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async updateJob(jobId: string, updates: Partial<CrawlJob>): Promise<void> {
    try {
      
      // Load current jobs from Redis
      const jobs = await this.loadJobsFromRedis();
      const job = jobs.get(jobId);
      
      if (!job) {
        return;
      }

      // Update the job
      const updatedJob = { ...job, ...updates, updatedAt: new Date().toISOString() };
      jobs.set(jobId, updatedJob);
      
      
      // Save back to Redis
      await this.saveJobsToRedis(jobs);
      
      // Verify the save worked by reading it back
      const verificationJobs = await this.loadJobsFromRedis();
      const verificationJob = verificationJobs.get(jobId);
      
    } catch (error) {
    }
  }

  async addLog(jobId: string, message: string, logType: 'info' | 'success' | 'error' | 'warning' = 'info'): Promise<void> {
    try {
      // Load current jobs from Redis
      const jobs = await this.loadJobsFromRedis();
      const job = jobs.get(jobId);
      
      if (!job) {
        return;
      }

      // Ensure message is a string
      const messageStr = typeof message === 'string' ? message : String(message);

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
    }
  }

  async getLogs(jobId: string): Promise<CrawlLog[]> {
    try {
      const jobs = await this.loadJobsFromRedis();
      const job = jobs.get(jobId);
      return job?.logs || [];
    } catch (error) {
      return [];
    }
  }

  async getAllJobs(): Promise<CrawlJob[]> {
    try {
      const jobs = await this.loadJobsFromRedis();
      return Array.from(jobs.values());
    } catch (error) {
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
      }
    } catch (error) {
    }
  }

  // Debug method to list all jobs
  async debugJobs(): Promise<void> {
    try {
      const jobs = await this.loadJobsFromRedis();
      Array.from(jobs.entries()).forEach(([id, job]) => {
      });
    } catch (error) {
    }
  }
}

// Export a singleton instance
export const crawlJobManager = new CrawlJobManager();
export type { CrawlJob, CrawlLog }; 
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

import { crawlJobManager } from "@/lib/crawlJobs";

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) => {
  
  try {
    // Add validation for context.params
    if (!context || !context.params) {
      return NextResponse.json(
        { error: "Invalid request context" },
        { status: 400 }
      );
    }

    
    const params = await context.params;
    
    // Add validation for jobId
    if (!params || !params.jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const { jobId } = params;

    // Get job from storage
    const job = await crawlJobManager.getJob(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Stop the job
    if (job.status === 'running') {
      await crawlJobManager.updateJob(jobId, { status: 'stopped' });
    } else {
    }

    return NextResponse.json({ message: "Crawling stopped" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 
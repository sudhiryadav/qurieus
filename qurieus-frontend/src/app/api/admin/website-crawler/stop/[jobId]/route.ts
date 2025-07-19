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
  console.log("=== Website Crawler Stop API Called ===");
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  console.log("Context:", context);
  console.log("Context type:", typeof context);
  console.log("Context params type:", typeof context?.params);
  
  try {
    // Add validation for context.params
    if (!context || !context.params) {
      console.log("❌ Context or context.params is null/undefined");
      console.log("Context:", context);
      console.log("Context.params:", context?.params);
      return NextResponse.json(
        { error: "Invalid request context" },
        { status: 400 }
      );
    }

    console.log("✅ Context and context.params exist");
    console.log("About to await context.params...");
    
    const params = await context.params;
    console.log("✅ Params resolved:", params);
    console.log("Params type:", typeof params);
    console.log("Params keys:", Object.keys(params || {}));
    
    // Add validation for jobId
    if (!params || !params.jobId) {
      console.log("❌ Params or jobId is missing");
      console.log("Params:", params);
      console.log("Params.jobId:", params?.jobId);
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const { jobId } = params;
    console.log("✅ JobId extracted:", jobId);

    // Get job from storage
    console.log("Looking up job with ID:", jobId);
    const job = await crawlJobManager.getJob(jobId);
    console.log("Job lookup result:", job);
    
    if (!job) {
      console.log("❌ Job not found for ID:", jobId);
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Stop the job
    if (job.status === 'running') {
      console.log("🛑 Stopping job:", jobId);
      await crawlJobManager.updateJob(jobId, { status: 'stopped' });
      console.log("✅ Job stopped successfully");
    } else {
      console.log("ℹ️ Job is not running, status:", job.status);
    }

    return NextResponse.json({ message: "Crawling stopped" });
  } catch (error) {
    console.error("❌ Error in website crawler stop API:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 
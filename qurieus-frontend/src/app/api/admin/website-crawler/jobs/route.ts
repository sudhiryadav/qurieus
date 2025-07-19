import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

import { crawlJobManager } from "@/lib/crawlJobs";

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  try {
    // Return all jobs
    const jobs = await crawlJobManager.getAllJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error getting crawl jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

import { crawlJobManager } from "@/lib/crawlJobs";

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) => {
  try {
    const params = await context.params;
    
    if (!params || !params.jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const { jobId } = params;
    const logs = await crawlJobManager.getLogs(jobId);
    
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 
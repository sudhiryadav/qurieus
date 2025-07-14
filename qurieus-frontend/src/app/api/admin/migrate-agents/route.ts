import { NextResponse } from "next/server";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { createMissingAgentRecords } from "@/utils/agentUtils";
import { logger } from "@/lib/logger";

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(
  async (request: Request) => {
    try {
      logger.info("Starting agent migration");
      
      const result = await createMissingAgentRecords();
      
      logger.info("Agent migration completed", result);
      
      return NextResponse.json({
        success: true,
        message: "Agent migration completed",
        result
      });
      
    } catch (error) {
      logger.error("Agent migration failed", { error });
      
      return NextResponse.json({
        success: false,
        error: "Migration failed",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  }
); 
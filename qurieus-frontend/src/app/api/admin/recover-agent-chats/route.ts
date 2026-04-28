import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { manualAgentChatRecovery } from "@/lib/cron";
import { errorResponse } from "@/utils/responser";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

export const POST = RequireRoles([UserRole.ADMIN])(async (request: NextRequest) => {
  try {

    const result = await manualAgentChatRecovery();

    logger.info("Admin API: Manual agent chat recovery completed", {
      chatCountsFixed: result.chatCountsFixed,
      disconnectsHandled: result.disconnectsHandled,
      orphanedCleaned: result.orphanedCleaned,
      errors: result.errors
    });

    return NextResponse.json({
      success: true,
      message: "Agent chat recovery completed successfully",
      result: {
        chatCountsFixed: result.chatCountsFixed,
        disconnectsHandled: result.disconnectsHandled,
        orphanedCleaned: result.orphanedCleaned,
        errors: result.errors
      }
    });

  } catch (error) {
    logger.error("Admin API: Error in manual agent chat recovery", {
      error: error instanceof Error ? error.message : String(error)
    });

    return errorResponse({
      error: "An error occurred while running agent chat recovery",
      status: 500
    });
  }
}); 
import { NextResponse } from "next/server";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { errorResponse } from "@/utils/responser";
import { getServerSession } from "next-auth";
import { logger } from "@/lib/logger";
import { RequireRoles, invalidateUserCache } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { ensureAgentRecord } from "@/utils/agentUtils";
import { fixAgentChatCounts } from "@/lib/agentChatRecovery";

// GET /api/agent/status - Get current agent status
export const GET = RequireRoles([UserRole.AGENT])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const userId = session!.user!.id;

    // Ensure agent record exists
    const agentExists = await ensureAgentRecord(userId);
    if (!agentExists) {
      return errorResponse({ 
        error: "Failed to ensure agent record exists", 
        status: 500 
      });
    }

    // Run automatic chat count recovery (this will fix any stale counts)
    try {
      await fixAgentChatCounts();
    } catch (recoveryError) {
      logger.warn("Agent Status API: Chat count recovery failed", { 
        userId,
        error: recoveryError instanceof Error ? recoveryError.message : String(recoveryError)
      });
      // Don't fail the request if recovery fails
    }

    // Get current agent status
    const agent = await prisma.agent.findUnique({
      where: { userId: userId },
      select: {
        isOnline: true,
        isAvailable: true,
        currentChats: true,
        maxConcurrentChats: true,
        lastActiveAt: true
      }
    });

    if (!agent) {
      return errorResponse({ 
        error: "Agent record not found", 
        status: 404 
      });
    }

    logger.info("Agent Status API: Retrieved agent status", { 
      userId, 
      isOnline: agent.isOnline, 
      isAvailable: agent.isAvailable 
    });

    return NextResponse.json({ 
      success: true, 
      status: {
        isOnline: agent.isOnline,
        isAvailable: agent.isAvailable,
        currentChats: agent.currentChats,
        maxConcurrentChats: agent.maxConcurrentChats,
        lastActiveAt: agent.lastActiveAt
      }
    });

  } catch (error) {
    logger.error("Agent Status API: Error retrieving agent status", { 
      error: error instanceof Error ? error.message : String(error)
    });
    return errorResponse({ 
      error: "An error occurred while retrieving agent status", 
      status: 500 
    });
  }
});

export const PUT = RequireRoles([UserRole.AGENT])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const userId = session!.user!.id;
    const body = await request.json();
    const { isOnline, isAvailable } = body;

    if (typeof isOnline !== 'boolean' || typeof isAvailable !== 'boolean') {
      return errorResponse({ error: "Invalid status parameters", status: 400 });
    }

    // Ensure agent record exists
    const agentExists = await ensureAgentRecord(userId);
    if (!agentExists) {
      return errorResponse({ 
        error: "Failed to ensure agent record exists", 
        status: 500 
      });
    }

    // Update agent status
    const agent = await prisma.agent.update({
      where: { userId: userId },
      data: {
        isOnline,
        isAvailable,
        lastActiveAt: new Date()
      }
    });

    // Emit Socket.IO event for status update
    try {
      const io = (global as any).io;
      if (io) {
        io.emit('agent_status_update', {
          agentId: userId,
          isOnline,
          isAvailable
        });
      }
    } catch (socketError) {
      logger.warn("Agent Status API: Failed to emit Socket.IO event", { 
        error: socketError instanceof Error ? socketError.message : String(socketError)
      });
    }

    // Invalidate user cache since agent data changed
    await invalidateUserCache(userId);

    logger.info("Agent Status API: Agent status updated", { 
      userId, 
      isOnline, 
      isAvailable 
    });

    return NextResponse.json({ 
      success: true, 
      status: { isOnline, isAvailable } 
    });

  } catch (error) {
    logger.error("Agent Status API: Error updating agent status", { 
      error: error instanceof Error ? error.message : String(error)
    });
    return errorResponse({ 
      error: "An error occurred while updating agent status", 
      status: 500 
    });
  }
}); 
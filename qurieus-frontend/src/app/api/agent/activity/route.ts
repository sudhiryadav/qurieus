import { NextResponse } from "next/server";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { errorResponse } from "@/utils/responser";
import { getServerSession } from "next-auth";
import { logger } from "@/lib/logger";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

// Function to automatically mark inactive agents as offline
async function markInactiveAgentsAsOffline() {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    // Find agents who haven't been active in the last 10 minutes
    const inactiveAgents = await prisma.user.findMany({
      where: {
        role: UserRole.AGENT,
        is_active: true,
        updated_at: {
          lt: tenMinutesAgo
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        updated_at: true
      }
    });

    if (inactiveAgents.length > 0) {
      logger.info("Agent Activity API: Found inactive agents", { 
        count: inactiveAgents.length,
        agentIds: inactiveAgents.map(a => a.id)
      });

      // Mark them as inactive
      await prisma.user.updateMany({
        where: {
          id: {
            in: inactiveAgents.map(a => a.id)
          }
        },
        data: {
          is_active: false
        }
      });

      logger.info("Agent Activity API: Marked inactive agents as offline", { 
        count: inactiveAgents.length 
      });
    }
  } catch (error) {
    logger.error("Agent Activity API: Error marking inactive agents as offline", { 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Update agent activity status
export const POST = RequireRoles([UserRole.AGENT])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    const agentId = session!.user!.id;
    
    const body = await request.json();
    const { isOnline, isAvailable } = body;

    // Update agent's last activity timestamp
    await prisma.user.update({
      where: { id: agentId },
      data: {
        updated_at: new Date(),
        is_active: isOnline, // Update active status based on online status
        // You might want to add specific fields for tracking agent activity
        // lastActivity: new Date(),
        // isOnline: isOnline,
        // isAvailable: isAvailable
      }
    });

    logger.info("Agent Activity API: Agent activity updated", { 
      agentId, 
      isOnline, 
      isAvailable 
    });

    return NextResponse.json({ 
      success: true, 
      message: "Activity updated successfully"
    });

  } catch (error) {
    logger.error("Agent Activity API: Error updating agent activity", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return errorResponse({ error: "An error occurred while updating activity", status: 500 });
  }
});

// Get agent activity status (for monitoring)
export const GET = RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return errorResponse({ error: "User ID is required", status: 400 });
    }

    // First, mark any inactive agents as offline
    await markInactiveAgentsAsOffline();

    // Get all agents for the user with their activity status
    const agents = await prisma.user.findMany({
      where: {
        parentUserId: userId,
        role: UserRole.AGENT,
        is_active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        updated_at: true,
        // Add any additional activity tracking fields here
      }
    });

    // Calculate activity status based on last update time
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const agentsWithActivity = agents.map(agent => ({
      ...agent,
      isOnline: agent.updated_at > fiveMinutesAgo,
      lastActivity: agent.updated_at
    }));

    logger.info("Agent Activity API: Retrieved agent activity status", { 
      userId, 
      agentCount: agentsWithActivity.length 
    });

    return NextResponse.json({ 
      success: true, 
      agents: agentsWithActivity
    });

  } catch (error) {
    logger.error("Agent Activity API: Error retrieving agent activity", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return errorResponse({ error: "An error occurred while retrieving activity", status: 500 });
  }
}); 
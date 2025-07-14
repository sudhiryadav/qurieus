import { prisma } from "./prismaDB";
import { logger } from "@/lib/logger";
import { UserRole } from "@prisma/client";

/**
 * Ensures that an Agent record exists for a user with AGENT role
 * Creates the Agent record if it doesn't exist
 */
export async function ensureAgentRecord(userId: string): Promise<boolean> {
  try {
    // Check if user exists and has AGENT role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true }
    });

    if (!user) {
      logger.warn(`ensureAgentRecord: User not found`, { userId });
      return false;
    }

    if (user.role !== UserRole.AGENT) {
      logger.warn(`ensureAgentRecord: User is not an agent`, { userId, role: user.role });
      return false;
    }

    // Check if Agent record already exists
    const existingAgent = await prisma.agent.findUnique({
      where: { userId: userId }
    });

    if (existingAgent) {
      return true; // Agent record already exists
    }

    // Create Agent record
    await prisma.agent.create({
      data: {
        userId: userId,
        displayName: user.name,
        isOnline: false,
        isAvailable: true,
      }
    });

    logger.info(`ensureAgentRecord: Created agent record for user`, { userId, displayName: user.name });
    return true;

  } catch (error) {
    logger.error(`ensureAgentRecord: Error ensuring agent record`, { 
      userId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return false;
  }
}

/**
 * Creates Agent records for all users with AGENT role that don't have them
 * This is useful for migrating existing data
 */
export async function createMissingAgentRecords(): Promise<{ created: number; errors: number }> {
  try {
    // Find all users with AGENT role
    const agentUsers = await prisma.user.findMany({
      where: { role: UserRole.AGENT },
      select: { id: true, name: true }
    });

    let created = 0;
    let errors = 0;

    for (const user of agentUsers) {
      try {
        const success = await ensureAgentRecord(user.id);
        if (success) {
          created++;
        } else {
          errors++;
        }
      } catch (error) {
        logger.error(`createMissingAgentRecords: Error for user ${user.id}`, { error });
        errors++;
      }
    }

    logger.info(`createMissingAgentRecords: Completed`, { created, errors, total: agentUsers.length });
    return { created, errors };

  } catch (error) {
    logger.error(`createMissingAgentRecords: Error`, { error });
    return { created: 0, errors: 1 };
  }
} 
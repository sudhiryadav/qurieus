import { prisma } from '@/utils/prismaDB';
import { logger } from '@/lib/logger';

/**
 * Automatically recalculates and fixes agent chat counts
 * This should be called periodically or when needed
 */
export async function fixAgentChatCounts(): Promise<{ fixed: number; errors: number }> {
  let fixed = 0;
  let errors = 0;

  try {
    logger.info('Agent Chat Recovery: Starting automatic chat count fix');

    // Get all agents
    const agents = await prisma.agent.findMany({
      select: {
        userId: true,
        currentChats: true,
        displayName: true
      }
    });

    for (const agent of agents) {
      try {
        // Count actual open chats for this agent
        const actualOpenChats = await prisma.agentChat.count({
          where: {
            agentId: agent.userId,
            status: {
              in: ['PENDING', 'ACTIVE', 'ON_HOLD']
            }
          }
        });

        // If the count is different, fix it
        if (actualOpenChats !== agent.currentChats) {
          await prisma.agent.update({
            where: { userId: agent.userId },
            data: { currentChats: actualOpenChats }
          });

          logger.info('Agent Chat Recovery: Fixed chat count', {
            agentId: agent.userId,
            agentName: agent.displayName,
            oldCount: agent.currentChats,
            newCount: actualOpenChats
          });

          fixed++;
        }
      } catch (error) {
        logger.error('Agent Chat Recovery: Error fixing agent chat count', {
          agentId: agent.userId,
          error: error instanceof Error ? error.message : String(error)
        });
        errors++;
      }
    }

    logger.info('Agent Chat Recovery: Completed automatic chat count fix', {
      fixed,
      errors,
      total: agents.length
    });

    return { fixed, errors };
  } catch (error) {
    logger.error('Agent Chat Recovery: Error in fixAgentChatCounts', {
      error: error instanceof Error ? error.message : String(error)
    });
    return { fixed, errors: errors + 1 };
  }
}

/**
 * Handles user disconnect by closing their chat and updating agent counts
 */
export async function handleUserDisconnect(conversationId: string): Promise<boolean> {
  try {
    logger.info('Agent Chat Recovery: Handling user disconnect', { conversationId });

    // Find the agent chat for this conversation
    const agentChat = await prisma.agentChat.findUnique({
      where: { conversationId },
      select: {
        id: true,
        agentId: true,
        status: true
      }
    });

    if (!agentChat) {
      logger.info('Agent Chat Recovery: No agent chat found for conversation', { conversationId });
      return false;
    }

    // Only process if the chat is still open
    if (!['PENDING', 'ACTIVE', 'ON_HOLD'].includes(agentChat.status)) {
      logger.info('Agent Chat Recovery: Chat already closed', { 
        conversationId, 
        status: agentChat.status 
      });
      return false;
    }

    // Get agent info for logging
    const agent = await prisma.agent.findUnique({
      where: { userId: agentChat.agentId },
      select: {
        displayName: true,
        currentChats: true
      }
    });

    // Close the chat
    await prisma.agentChat.update({
      where: { conversationId },
      data: {
        status: 'CLOSED',
        endedAt: new Date()
      }
    });

    // Decrement agent's chat count
    await prisma.agent.update({
      where: { userId: agentChat.agentId },
      data: {
        currentChats: {
          decrement: 1
        }
      }
    });

    logger.info('Agent Chat Recovery: Successfully handled user disconnect', {
      conversationId,
      agentId: agentChat.agentId,
      agentName: agent?.displayName,
      oldChatCount: agent?.currentChats,
      newChatCount: (agent?.currentChats || 1) - 1
    });

    return true;
  } catch (error) {
    logger.error('Agent Chat Recovery: Error handling user disconnect', {
      conversationId,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Cleanup orphaned agent chats (chats that exist but conversation is deleted)
 */
export async function cleanupOrphanedAgentChats(): Promise<{ cleaned: number; errors: number }> {
  let cleaned = 0;
  let errors = 0;

  try {
    logger.info('Agent Chat Recovery: Starting orphaned chat cleanup');

    // Find agent chats where the conversation no longer exists
    // We'll do this by checking if the conversation exists for each agent chat
    const allAgentChats = await prisma.agentChat.findMany({
      select: {
        id: true,
        agentId: true,
        conversationId: true
      }
    });

    for (const chat of allAgentChats) {
      try {
        // Check if conversation still exists
        const conversation = await prisma.chatConversation.findUnique({
          where: { id: chat.conversationId },
          select: { id: true }
        });

        if (!conversation) {
          // Decrement agent's chat count if this was an open chat
          await prisma.agent.update({
            where: { userId: chat.agentId },
            data: {
              currentChats: {
                decrement: 1
              }
            }
          });

          // Delete the orphaned chat
          await prisma.agentChat.delete({
            where: { id: chat.id }
          });

          logger.info('Agent Chat Recovery: Cleaned orphaned chat', {
            chatId: chat.id,
            conversationId: chat.conversationId,
            agentId: chat.agentId
          });

          cleaned++;
        }
      } catch (error) {
        logger.error('Agent Chat Recovery: Error cleaning orphaned chat', {
          chatId: chat.id,
          error: error instanceof Error ? error.message : String(error)
        });
        errors++;
      }
    }

    logger.info('Agent Chat Recovery: Completed orphaned chat cleanup', {
      cleaned,
      errors,
      total: allAgentChats.length
    });

    return { cleaned, errors };
  } catch (error) {
    logger.error('Agent Chat Recovery: Error in cleanupOrphanedAgentChats', {
      error: error instanceof Error ? error.message : String(error)
    });
    return { cleaned, errors: errors + 1 };
  }
}

/**
 * Comprehensive recovery function that runs all cleanup operations
 */
export async function runAgentChatRecovery(): Promise<{
  chatCountsFixed: number;
  disconnectsHandled: number;
  orphanedCleaned: number;
  errors: number;
}> {
  logger.info('Agent Chat Recovery: Starting comprehensive recovery');

  const [chatCountsResult, orphanedResult] = await Promise.all([
    fixAgentChatCounts(),
    cleanupOrphanedAgentChats()
  ]);

  logger.info('Agent Chat Recovery: Comprehensive recovery completed', {
    chatCountsFixed: chatCountsResult.fixed,
    orphanedCleaned: orphanedResult.cleaned,
    errors: chatCountsResult.errors + orphanedResult.errors
  });

  return {
    chatCountsFixed: chatCountsResult.fixed,
    disconnectsHandled: 0, // This is handled per-disconnect
    orphanedCleaned: orphanedResult.cleaned,
    errors: chatCountsResult.errors + orphanedResult.errors
  };
} 
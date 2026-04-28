import { runAgentChatRecovery } from './agentChatRecovery';
import { logger } from './logger';

/**
 * Scheduled job to run agent chat recovery
 * This should be called periodically (e.g., every 5 minutes) to fix stale chat counts
 */
export async function scheduledAgentChatRecovery() {
  try {
    
    const result = await runAgentChatRecovery();
    
    logger.info('Cron: Scheduled agent chat recovery completed', {
      chatCountsFixed: result.chatCountsFixed,
      disconnectsHandled: result.disconnectsHandled,
      orphanedCleaned: result.orphanedCleaned,
      errors: result.errors
    });
    
    return result;
  } catch (error) {
    logger.error('Cron: Error in scheduled agent chat recovery', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Manual trigger for agent chat recovery
 * Can be called from admin panel or API endpoint
 */
export async function manualAgentChatRecovery() {
  try {
    
    const result = await runAgentChatRecovery();
    
    logger.info('Manual: Agent chat recovery completed', {
      chatCountsFixed: result.chatCountsFixed,
      disconnectsHandled: result.disconnectsHandled,
      orphanedCleaned: result.orphanedCleaned,
      errors: result.errors
    });
    
    return result;
  } catch (error) {
    logger.error('Manual: Error in agent chat recovery', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
} 
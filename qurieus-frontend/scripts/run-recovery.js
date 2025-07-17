const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAgentChatCounts() {
  let fixed = 0;
  let errors = 0;

  try {
    console.log('🔧 Starting automatic chat count fix...');

    // Get all agents
    const agents = await prisma.agent.findMany({
      select: {
        userId: true,
        currentChats: true,
        displayName: true
      }
    });

    console.log(`Found ${agents.length} agents`);

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

          console.log(`✅ Fixed agent ${agent.displayName}: ${agent.currentChats} → ${actualOpenChats}`);
          fixed++;
        } else {
          console.log(`✅ Agent ${agent.displayName}: count is correct (${actualOpenChats})`);
        }
      } catch (error) {
        console.error(`❌ Error fixing agent ${agent.displayName}:`, error.message);
        errors++;
      }
    }

    console.log(`\n🎉 Recovery completed: ${fixed} fixed, ${errors} errors`);

    return { fixed, errors };
  } catch (error) {
    console.error('❌ Error in fixAgentChatCounts:', error.message);
    return { fixed, errors: errors + 1 };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the recovery
fixAgentChatCounts()
  .then(() => {
    console.log('✅ Recovery script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Recovery script failed:', error);
    process.exit(1);
  }); 
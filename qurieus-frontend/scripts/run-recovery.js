const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAgentChatCounts() {
  let fixed = 0;
  let errors = 0;

  try {

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

          fixed++;
        } else {
        }
      } catch (error) {
        errors++;
      }
    }


    return { fixed, errors };
  } catch (error) {
    return { fixed, errors: errors + 1 };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the recovery
fixAgentChatCounts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  }); 
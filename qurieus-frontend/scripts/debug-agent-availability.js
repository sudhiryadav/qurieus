const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAgentAvailability() {

  try {
    // 1. Check all users with AGENT role
    const agentUsers = await prisma.user.findMany({
      where: { role: 'AGENT' },
      include: {
        agent: true
      }
    });

    if (agentUsers.length === 0) {
      return;
    }

    agentUsers.forEach(user => {
      if (user.agent) {
      }
    });

    // 2. Check for available agents (using the same logic as findAvailableAgent)
    const availableAgents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        is_active: true,
        agent: {
          isOnline: true,
          isAvailable: true,
          currentChats: {
            lt: prisma.agent.fields.maxConcurrentChats
          }
        }
      },
      include: {
        agent: true
      },
      orderBy: [
        { agent: { currentChats: 'asc' } },
        { agent: { lastActiveAt: 'desc' } }
      ]
    });

    if (availableAgents.length === 0) {
      
      // Check why agents are not available
      const allAgents = await prisma.user.findMany({
        where: { role: 'AGENT', is_active: true },
        include: { agent: true }
      });

      allAgents.forEach(agent => {
        if (!agent.agent) {
        } else {
          if (agent.agent.currentChats >= agent.agent.maxConcurrentChats) {
          }
        }
      });
    } else {
      availableAgents.forEach(agent => {
      });
    }

    // 4. Check recent escalated conversations
    const recentEscalated = await prisma.chatConversation.findMany({
      where: {
        status: 'ESCALATED',
        escalatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        agentChat: {
          include: {
            agent: true
          }
        }
      },
      orderBy: { escalatedAt: 'desc' },
      take: 10
    });

    if (recentEscalated.length === 0) {
    } else {
      recentEscalated.forEach(conv => {
        if (conv.agentChat) {
        } else {
        }
      });
    }

    // 5. Check pending agent chats
    const pendingChats = await prisma.agentChat.findMany({
      where: { status: 'PENDING' },
      include: {
        agent: true,
        conversation: true
      }
    });

    if (pendingChats.length === 0) {
    } else {
      pendingChats.forEach(chat => {
      });
    }

  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug function
debugAgentAvailability()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  }); 
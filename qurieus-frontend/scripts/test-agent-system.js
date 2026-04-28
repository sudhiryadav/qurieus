const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAgentSystem() {

  try {
    // 1. Check if there are any agents in the system
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      include: {
        agent: true
      }
    });

    if (agents.length === 0) {
      return;
    }

    agents.forEach(agent => {
      if (agent.agent) {
      }
    });

    // 2. Check for users who can own agents
    const potentialOwners = await prisma.user.findMany({
      where: { 
        role: { in: ['USER', 'ADMIN'] },
        is_active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        agents: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    potentialOwners.forEach(owner => {
      if (owner.agents.length > 0) {
        owner.agents.forEach(agent => {
        });
      }
    });

    // 3. Check for escalated conversations
    const escalatedConversations = await prisma.chatConversation.findMany({
      where: { status: 'ESCALATED' },
      include: {
        agentChat: {
          include: {
            agent: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    escalatedConversations.forEach(conv => {
      if (conv.agentChat) {
      } else {
      }
    });

    // 4. Check for pending agent chats
    const pendingChats = await prisma.agentChat.findMany({
      where: { status: 'PENDING' },
      include: {
        agent: {
          select: {
            name: true,
            email: true,
            agent: {
              select: {
                isOnline: true,
                isAvailable: true,
                currentChats: true,
                maxConcurrentChats: true
              }
            }
          }
        },
        conversation: {
          select: {
            id: true,
            visitorId: true,
            status: true
          }
        }
      }
    });

    pendingChats.forEach(chat => {
    });

    // 5. Provide recommendations
    
    if (agents.length === 0) {
    } else {
      const offlineAgents = agents.filter(agent => agent.agent && !agent.agent.isOnline);
      if (offlineAgents.length > 0) {
        offlineAgents.forEach(agent => {
        });
      }
      
      const unavailableAgents = agents.filter(agent => agent.agent && !agent.agent.isAvailable);
      if (unavailableAgents.length > 0) {
        unavailableAgents.forEach(agent => {
        });
      }
      
      if (offlineAgents.length === 0 && unavailableAgents.length === 0) {
      }
    }

    if (escalatedConversations.length === 0) {
    }


  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAgentSystem(); 
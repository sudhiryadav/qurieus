const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNewEscalation() {

  try {
    // 1. Find the existing conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        visitorId: 'v_4jqomezwq',
        userId: 'cmd052lie0000vj4kgg43y6yv'
      },
      include: {
        agentChat: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!conversation) {
      return;
    }


    // 2. Find available agents
    const availableAgents = await prisma.user.findMany({
      where: {
        parentUserId: 'cmd052lie0000vj4kgg43y6yv',
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
      }
    });

    if (availableAgents.length === 0) {
      return;
    }

    availableAgents.forEach(agent => {
    });

    // 3. Simulate escalation logic
    
    // Check if there's already an active agent chat
    const existingActiveChat = await prisma.agentChat.findFirst({
      where: {
        conversationId: conversation.id,
        status: {
          in: ['PENDING', 'ACTIVE', 'ON_HOLD']
        }
      }
    });

    if (existingActiveChat) {
      return;
    }

    // Check for resolved/closed chat
    const previousResolvedChat = await prisma.agentChat.findFirst({
      where: {
        conversationId: conversation.id,
        status: {
          in: ['RESOLVED', 'CLOSED']
        }
      }
    });

    if (previousResolvedChat) {
    }

    // 4. Create new agent chat assignment
    const agentId = availableAgents[0].id;

    const newAgentChat = await prisma.agentChat.create({
      data: {
        conversationId: conversation.id,
        agentId: agentId,
        status: 'PENDING',
        priority: 'NORMAL',
        assignedAt: new Date()
      }
    });


    // 5. Update agent's current chat count
    await prisma.agent.update({
      where: { userId: agentId },
      data: {
        currentChats: { increment: 1 }
      }
    });


    // 6. Update conversation status
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: {
        status: 'ESCALATED',
        escalatedAt: new Date(),
        escalationReason: 'User requested human support - New escalation'
      }
    });


    // 7. Verify the new assignment
    const verifyChat = await prisma.agentChat.findUnique({
      where: { id: newAgentChat.id },
      include: {
        agent: {
          select: { name: true, email: true }
        },
        conversation: {
          select: { status: true, escalatedAt: true }
        }
      }
    });



  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

testNewEscalation(); 
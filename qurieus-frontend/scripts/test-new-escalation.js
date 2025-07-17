const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNewEscalation() {
  console.log('🔍 Testing New Agent Escalation...\n');

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
      console.log('❌ Conversation not found');
      return;
    }

    console.log('1. Current conversation state:');
    console.log(`   - Conversation ID: ${conversation.id}`);
    console.log(`   - Status: ${conversation.status}`);
    console.log(`   - Escalated At: ${conversation.escalatedAt}`);
    console.log(`   - Agent Chat Status: ${conversation.agentChat?.status || 'None'}`);
    console.log(`   - Recent Messages: ${conversation.messages.length}`);
    console.log('');

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

    console.log('2. Available agents:');
    if (availableAgents.length === 0) {
      console.log('❌ No available agents found');
      return;
    }

    availableAgents.forEach(agent => {
      console.log(`   - ${agent.name} (${agent.email})`);
      console.log(`     Online: ${agent.agent?.isOnline}`);
      console.log(`     Available: ${agent.agent?.isAvailable}`);
      console.log(`     Current Chats: ${agent.agent?.currentChats}/${agent.agent?.maxConcurrentChats}`);
    });
    console.log('');

    // 3. Simulate escalation logic
    console.log('3. Simulating escalation...');
    
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
      console.log(`❌ Found existing active chat: ${existingActiveChat.status}`);
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
      console.log(`✅ Found previous resolved chat: ${previousResolvedChat.status}`);
    }

    // 4. Create new agent chat assignment
    const agentId = availableAgents[0].id;
    console.log(`4. Creating new agent chat assignment for agent: ${availableAgents[0].name}`);

    const newAgentChat = await prisma.agentChat.create({
      data: {
        conversationId: conversation.id,
        agentId: agentId,
        status: 'PENDING',
        priority: 'NORMAL',
        assignedAt: new Date()
      }
    });

    console.log(`✅ Created new agent chat: ${newAgentChat.id}`);

    // 5. Update agent's current chat count
    await prisma.agent.update({
      where: { userId: agentId },
      data: {
        currentChats: { increment: 1 }
      }
    });

    console.log('✅ Updated agent chat count');

    // 6. Update conversation status
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: {
        status: 'ESCALATED',
        escalatedAt: new Date(),
        escalationReason: 'User requested human support - New escalation'
      }
    });

    console.log('✅ Updated conversation status');

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

    console.log('5. Verification:');
    console.log(`   - Agent Chat ID: ${verifyChat.id}`);
    console.log(`   - Status: ${verifyChat.status}`);
    console.log(`   - Assigned Agent: ${verifyChat.agent.name}`);
    console.log(`   - Conversation Status: ${verifyChat.conversation.status}`);
    console.log(`   - Escalated At: ${verifyChat.conversation.escalatedAt}`);

    console.log('\n🎯 Test completed successfully!');
    console.log('The agent should now see this chat in the PENDING tab.');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewEscalation(); 
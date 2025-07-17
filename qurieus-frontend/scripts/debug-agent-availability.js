const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAgentAvailability() {
  console.log('🔍 Debugging Agent Availability Issues...\n');

  try {
    // 1. Check all users with AGENT role
    console.log('1. Checking all users with AGENT role:');
    const agentUsers = await prisma.user.findMany({
      where: { role: 'AGENT' },
      include: {
        agent: true
      }
    });

    if (agentUsers.length === 0) {
      console.log('❌ No users with AGENT role found');
      return;
    }

    agentUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
      console.log(`     Active: ${user.is_active}`);
      console.log(`     Agent Record: ${user.agent ? 'Yes' : 'No'}`);
      if (user.agent) {
        console.log(`     Online: ${user.agent.isOnline}`);
        console.log(`     Available: ${user.agent.isAvailable}`);
        console.log(`     Current Chats: ${user.agent.currentChats}/${user.agent.maxConcurrentChats}`);
        console.log(`     Last Active: ${user.agent.lastActiveAt}`);
      }
      console.log('');
    });

    // 2. Check for available agents (using the same logic as findAvailableAgent)
    console.log('2. Checking for available agents:');
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
      console.log('❌ No available agents found');
      
      // Check why agents are not available
      console.log('\n3. Checking why agents are not available:');
      const allAgents = await prisma.user.findMany({
        where: { role: 'AGENT', is_active: true },
        include: { agent: true }
      });

      allAgents.forEach(agent => {
        console.log(`   - ${agent.name}:`);
        if (!agent.agent) {
          console.log(`     ❌ No agent record`);
        } else {
          if (!agent.agent.isOnline) console.log(`     ❌ Not online`);
          if (!agent.agent.isAvailable) console.log(`     ❌ Not available`);
          if (agent.agent.currentChats >= agent.agent.maxConcurrentChats) {
            console.log(`     ❌ At max capacity: ${agent.agent.currentChats}/${agent.agent.maxConcurrentChats}`);
          }
        }
      });
    } else {
      console.log(`✅ Found ${availableAgents.length} available agent(s):`);
      availableAgents.forEach(agent => {
        console.log(`   - ${agent.name} (${agent.email})`);
        console.log(`     Current Chats: ${agent.agent.currentChats}/${agent.agent.maxConcurrentChats}`);
      });
    }

    // 4. Check recent escalated conversations
    console.log('\n4. Checking recent escalated conversations:');
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
      console.log('   No recent escalated conversations found');
    } else {
      recentEscalated.forEach(conv => {
        console.log(`   - Conversation ${conv.id}:`);
        console.log(`     Escalated: ${conv.escalatedAt}`);
        console.log(`     Reason: ${conv.escalationReason}`);
        if (conv.agentChat) {
          console.log(`     Assigned to: ${conv.agentChat.agent?.displayName || 'Unknown'}`);
          console.log(`     Status: ${conv.agentChat.status}`);
        } else {
          console.log(`     ❌ No agent assigned`);
        }
      });
    }

    // 5. Check pending agent chats
    console.log('\n5. Checking pending agent chats:');
    const pendingChats = await prisma.agentChat.findMany({
      where: { status: 'PENDING' },
      include: {
        agent: true,
        conversation: true
      }
    });

    if (pendingChats.length === 0) {
      console.log('   No pending agent chats found');
    } else {
      console.log(`   Found ${pendingChats.length} pending chats:`);
      pendingChats.forEach(chat => {
        console.log(`   - Chat ${chat.id}:`);
        console.log(`     Assigned to: ${chat.agent?.displayName || 'Unknown'}`);
        console.log(`     Assigned at: ${chat.assignedAt}`);
        console.log(`     Conversation: ${chat.conversationId}`);
      });
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug function
debugAgentAvailability()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }); 
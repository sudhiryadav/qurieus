const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAgentSystem() {
  console.log('🔍 Testing Agent System...\n');

  try {
    // 1. Check if there are any agents in the system
    console.log('1. Checking for agents...');
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      include: {
        agent: true
      }
    });

    if (agents.length === 0) {
      console.log('❌ No agents found in the system');
      console.log('💡 Create an agent first by going to /user/agents and creating one');
      return;
    }

    console.log(`✅ Found ${agents.length} agent(s):`);
    agents.forEach(agent => {
      console.log(`   - ${agent.name} (${agent.email})`);
      console.log(`     Role: ${agent.role}`);
      console.log(`     Active: ${agent.is_active}`);
      console.log(`     Agent Record: ${agent.agent ? '✅' : '❌'}`);
      if (agent.agent) {
        console.log(`     Online: ${agent.agent.isOnline}`);
        console.log(`     Available: ${agent.agent.isAvailable}`);
        console.log(`     Current Chats: ${agent.agent.currentChats}/${agent.agent.maxConcurrentChats}`);
      }
      console.log(`     Parent User ID: ${agent.parentUserId || 'None'}`);
      console.log('');
    });

    // 2. Check for users who can own agents
    console.log('2. Checking for potential agent owners...');
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

    console.log(`✅ Found ${potentialOwners.length} potential agent owner(s):`);
    potentialOwners.forEach(owner => {
      console.log(`   - ${owner.name} (${owner.email}) - ${owner.role}`);
      console.log(`     Has ${owner.agents.length} agent(s)`);
      if (owner.agents.length > 0) {
        owner.agents.forEach(agent => {
          console.log(`       • ${agent.name} (${agent.email})`);
        });
      }
      console.log('');
    });

    // 3. Check for escalated conversations
    console.log('3. Checking for escalated conversations...');
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

    console.log(`✅ Found ${escalatedConversations.length} escalated conversation(s):`);
    escalatedConversations.forEach(conv => {
      console.log(`   - Conversation ID: ${conv.id}`);
      console.log(`     User: ${conv.user.name} (${conv.user.email})`);
      console.log(`     Visitor ID: ${conv.visitorId}`);
      console.log(`     Status: ${conv.status}`);
      console.log(`     Escalated At: ${conv.escalatedAt}`);
      console.log(`     Reason: ${conv.escalationReason}`);
      if (conv.agentChat) {
        console.log(`     Assigned Agent: ${conv.agentChat.agent.name} (${conv.agentChat.agent.email})`);
        console.log(`     Agent Chat Status: ${conv.agentChat.status}`);
      } else {
        console.log(`     ❌ No agent assigned`);
      }
      console.log('');
    });

    // 4. Check for pending agent chats
    console.log('4. Checking for pending agent chats...');
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

    console.log(`✅ Found ${pendingChats.length} pending agent chat(s):`);
    pendingChats.forEach(chat => {
      console.log(`   - Chat ID: ${chat.id}`);
      console.log(`     Conversation ID: ${chat.conversationId}`);
      console.log(`     Assigned Agent: ${chat.agent.name} (${chat.agent.email})`);
      console.log(`     Agent Online: ${chat.agent.agent?.isOnline}`);
      console.log(`     Agent Available: ${chat.agent.agent?.isAvailable}`);
      console.log(`     Agent Chats: ${chat.agent.agent?.currentChats}/${chat.agent.agent?.maxConcurrentChats}`);
      console.log(`     Assigned At: ${chat.assignedAt}`);
      console.log('');
    });

    // 5. Provide recommendations
    console.log('5. Recommendations:');
    
    if (agents.length === 0) {
      console.log('   ❌ Create at least one agent first');
    } else {
      const offlineAgents = agents.filter(agent => agent.agent && !agent.agent.isOnline);
      if (offlineAgents.length > 0) {
        console.log(`   ⚠️  ${offlineAgents.length} agent(s) are offline. They need to go online to receive chats:`);
        offlineAgents.forEach(agent => {
          console.log(`      - ${agent.name} (${agent.email})`);
        });
      }
      
      const unavailableAgents = agents.filter(agent => agent.agent && !agent.agent.isAvailable);
      if (unavailableAgents.length > 0) {
        console.log(`   ⚠️  ${unavailableAgents.length} agent(s) are not available. They need to be set as available:`);
        unavailableAgents.forEach(agent => {
          console.log(`      - ${agent.name} (${agent.email})`);
        });
      }
      
      if (offlineAgents.length === 0 && unavailableAgents.length === 0) {
        console.log('   ✅ All agents are online and available');
      }
    }

    if (escalatedConversations.length === 0) {
      console.log('   💡 No escalated conversations found. To test the system:');
      console.log('      1. Start a chat with your widget');
      console.log('      2. Ask for human support (e.g., "I want to speak to a human")');
      console.log('      3. The chat should be escalated to an available agent');
    }

    console.log('\n🎯 To fix the issue:');
    console.log('   1. Make sure you have at least one agent created');
    console.log('   2. Ensure the agent is set to "Online" and "Available" in the agent dashboard');
    console.log('   3. Start a chat and request human support to trigger escalation');
    console.log('   4. Check the agent dashboard for pending chats');

  } catch (error) {
    console.error('❌ Error testing agent system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAgentSystem(); 
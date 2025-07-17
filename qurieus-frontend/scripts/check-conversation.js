const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConversation() {
  try {
    const conv = await prisma.chatConversation.findUnique({
      where: { id: 'cmd183fjz0005vjhvjrnhl01o' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        agentChat: {
          include: {
            agent: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });
    
    if (!conv) {
      console.log('Conversation not found');
      return;
    }
    
    console.log('Conversation Details:');
    console.log('ID:', conv.id);
    console.log('Status:', conv.status);
    console.log('Escalated At:', conv.escalatedAt);
    console.log('Reason:', conv.escalationReason);
    console.log('Total Messages:', conv.totalMessages);
    console.log('');
    
    console.log('Messages:');
    conv.messages.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.role}] ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      console.log(`    Created: ${msg.createdAt}`);
      if (msg.agentId) console.log(`    Agent ID: ${msg.agentId}`);
      console.log('');
    });
    
    if (conv.agentChat) {
      console.log('Agent Chat Details:');
      console.log('Status:', conv.agentChat.status);
      console.log('Assigned At:', conv.agentChat.assignedAt);
      console.log('Started At:', conv.agentChat.startedAt);
      console.log('Ended At:', conv.agentChat.endedAt);
      console.log('Agent:', conv.agentChat.agent.name);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConversation(); 
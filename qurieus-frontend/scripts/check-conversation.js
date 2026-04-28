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
      return;
    }
    
    
    conv.messages.forEach((msg, i) => {
    });
    
    if (conv.agentChat) {
    }
    
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

checkConversation(); 
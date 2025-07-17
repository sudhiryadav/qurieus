const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const agentChats = await prisma.agentChat.findMany({
    include: {
      agent: { select: { name: true, email: true } },
      conversation: {
        select: {
          id: true,
          visitorId: true,
          status: true,
          escalatedAt: true,
          user: { select: { email: true } }
        }
      }
    },
    orderBy: { assignedAt: 'desc' }
  });

  if (agentChats.length === 0) {
    console.log('No agent chats found.');
    return;
  }

  for (const chat of agentChats) {
    console.log(`ChatID: ${chat.conversationId}`);
    console.log(`  Status: ${chat.status}`);
    console.log(`  Agent: ${chat.agent?.name} (${chat.agent?.email})`);
    console.log(`  VisitorID: ${chat.conversation.visitorId}`);
    console.log(`  User: ${chat.conversation.user?.email}`);
    console.log(`  Conversation Status: ${chat.conversation.status}`);
    console.log(`  Escalated At: ${chat.conversation.escalatedAt}`);
    console.log('---');
  }
}

main().then(() => prisma.$disconnect()); 
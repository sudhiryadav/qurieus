const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const visitorId = process.argv[2];
if (!visitorId) {
  console.error('Usage: node scripts/check-conversations-by-visitor.js <visitorId>');
  process.exit(1);
}

async function main() {
  const conversations = await prisma.chatConversation.findMany({
    where: { visitorId },
    include: {
      agentChat: {
        include: {
          agent: { select: { name: true, email: true } }
        }
      },
      user: { select: { email: true } }
    },
    orderBy: { firstSeen: 'desc' }
  });

  if (conversations.length === 0) {
    console.log('No conversations found for visitor:', visitorId);
    return;
  }

  for (const conv of conversations) {
    console.log(`ConversationID: ${conv.id}`);
    console.log(`  Status: ${conv.status}`);
    console.log(`  Escalated At: ${conv.escalatedAt}`);
    console.log(`  User: ${conv.user?.email}`);
    if (conv.agentChat) {
      console.log(`  AgentChat Status: ${conv.agentChat.status}`);
      console.log(`  Agent: ${conv.agentChat.agent?.name} (${conv.agentChat.agent?.email})`);
    } else {
      console.log('  No agent chat');
    }
    console.log('---');
  }
}

main().then(() => prisma.$disconnect()); 
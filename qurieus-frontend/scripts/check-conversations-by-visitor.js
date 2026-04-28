const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const visitorId = process.argv[2];
if (!visitorId) {
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
    return;
  }

  for (const conv of conversations) {
    if (conv.agentChat) {
    } else {
    }
  }
}

main().then(() => prisma.$disconnect()); 
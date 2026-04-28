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
    return;
  }

  for (const chat of agentChats) {
  }
}

main().then(() => prisma.$disconnect()); 
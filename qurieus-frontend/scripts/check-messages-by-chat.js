const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const chatId = process.argv[2];
if (!chatId) {
  process.exit(1);
}

async function main() {
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: chatId },
    orderBy: { createdAt: 'asc' }
  });

  if (messages.length === 0) {
    return;
  }

  for (const msg of messages) {
  }
}

main().then(() => prisma.$disconnect()); 
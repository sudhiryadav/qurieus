const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const chatId = process.argv[2];
if (!chatId) {
  console.error('Usage: node scripts/check-messages-by-chat.js <chatId>');
  process.exit(1);
}

async function main() {
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: chatId },
    orderBy: { createdAt: 'asc' }
  });

  if (messages.length === 0) {
    console.log('No messages found for chat:', chatId);
    return;
  }

  for (const msg of messages) {
    console.log(`[${msg.role}] ${msg.content}`);
    console.log(`  Created: ${msg.createdAt}`);
    if (msg.agentId) console.log(`  Agent ID: ${msg.agentId}`);
    console.log('---');
  }
}

main().then(() => prisma.$disconnect()); 
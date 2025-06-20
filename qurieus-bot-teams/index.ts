import express, { Request, Response } from 'express';
import { BotFrameworkAdapter, TurnContext } from 'botbuilder';
import dotenv from 'dotenv';
dotenv.config();

console.log('Bot Configuration:');
console.log('  MicrosoftAppId:', process.env.MICROSOFT_APP_ID || 'Not Set');
console.log('  MicrosoftAppPassword:', process.env.MICROSOFT_APP_PASSWORD ? 'Set (hidden)' : 'Not Set');

const app = express();

// Use BotFrameworkAdapter instead of CloudAdapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
  channelAuthTenant: process.env.MICROSOFT_APP_TENANT_ID,
});

// Error handling
adapter.onTurnError = async (context: TurnContext, error: Error) => {
  console.error(`\n [onTurnError]: ${error}`);
  await context.sendActivity('Oops! Something went wrong.');
};

// Handle incoming messages - use express.json() for BotFrameworkAdapter
app.post('/api/messages', express.json(), async (req: Request, res: Response) => {
  console.log('--- Request received at /api/messages route ---');

  await adapter.processActivity(req, res, async (context: TurnContext) => {
    console.log(`Incoming Activity Type: ${context.activity.type}`);

    if (context.activity.type === 'message') {
      const userMessage = context.activity.text;
      console.log(`User said: "${userMessage}"`);
      await context.sendActivity(`You said: "${userMessage}"`);
    } else if (context.activity.type === 'conversationUpdate') {
      if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
        for (const member of context.activity.membersAdded) {
          if (member.id !== context.activity.recipient.id) {
            await context.sendActivity('Hello! I am your new bot. How can I assist you today?');
          }
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3978;
app.listen(PORT, () => {
  console.log(`\nBot is running on port ${PORT}`);
  console.log('Open Bot Framework Emulator and connect to http://localhost:3978/api/messages');
});
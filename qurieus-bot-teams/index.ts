import express, { Request, Response } from 'express';
import { BotFrameworkAdapter, TurnContext } from 'botbuilder';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Use BotFrameworkAdapter instead of CloudAdapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
  channelAuthTenant: process.env.MICROSOFT_APP_TENANT_ID,
});

// Error handling
adapter.onTurnError = async (context: TurnContext, error: Error) => {
  void error;
  await context.sendActivity('Oops! Something went wrong.');
};

// Handle incoming messages - use express.json() for BotFrameworkAdapter
app.post('/api/messages', express.json(), async (req: Request, res: Response) => {
  await adapter.processActivity(req, res, async (context: TurnContext) => {
    if (context.activity.type === 'message') {
      const userMessage = context.activity.text;
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
app.listen(PORT);
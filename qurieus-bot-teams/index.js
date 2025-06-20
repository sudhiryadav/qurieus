"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const botbuilder_1 = require("botbuilder");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log('Bot Configuration:');
console.log('  MicrosoftAppId:', process.env.MICROSOFT_APP_ID || 'Not Set');
console.log('  MicrosoftAppPassword:', process.env.MICROSOFT_APP_PASSWORD ? 'Set (hidden)' : 'Not Set');
const app = (0, express_1.default)();
// Use BotFrameworkAdapter instead of CloudAdapter
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
    channelAuthTenant: process.env.MICROSOFT_APP_TENANT_ID,
});
// Error handling
adapter.onTurnError = (context, error) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(`\n [onTurnError]: ${error}`);
    yield context.sendActivity('Oops! Something went wrong.');
});
// Handle incoming messages - use express.json() for BotFrameworkAdapter
app.post('/api/messages', express_1.default.json(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('--- Request received at /api/messages route ---');
    yield adapter.processActivity(req, res, (context) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Incoming Activity Type: ${context.activity.type}`);
        if (context.activity.type === 'message') {
            const userMessage = context.activity.text;
            console.log(`User said: "${userMessage}"`);
            yield context.sendActivity(`You said: "${userMessage}"`);
        }
        else if (context.activity.type === 'conversationUpdate') {
            if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
                for (const member of context.activity.membersAdded) {
                    if (member.id !== context.activity.recipient.id) {
                        yield context.sendActivity('Hello! I am your new bot. How can I assist you today?');
                    }
                }
            }
        }
    }));
}));
const PORT = process.env.PORT || 3978;
app.listen(PORT, () => {
    console.log(`\nBot is running on port ${PORT}`);
    console.log('Open Bot Framework Emulator and connect to http://localhost:3978/api/messages');
});

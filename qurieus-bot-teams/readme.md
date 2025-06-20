# Qurieus Microsoft Teams Bot

A Microsoft Teams bot built with the Bot Framework SDK that can be integrated with your Qurieus application for multichannel support.

## Features

- 🤖 Microsoft Teams integration
- 🔐 Azure AD authentication (Single Tenant)
- 📝 Message handling and responses
- 🚀 Express.js server
- 🔧 Environment-based configuration

## Prerequisites

- Node.js 18+ (use `nvm use 18` if you have multiple Node versions)
- Microsoft Azure account
- Bot Framework registration in Azure
- Teams application (optional, for testing)

## Setup

### 1. Install Dependencies

```bash
# Using yarn (recommended)
yarn install

# Or using npm
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Bot Framework Configuration
MICROSOFT_APP_ID=your-app-id-from-azure
MICROSOFT_APP_PASSWORD=your-app-password-from-azure
MICROSOFT_APP_TENANT_ID=your-tenant-id

# Server Configuration (optional)
PORT=3978
```

### 3. Azure Bot Registration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a new Bot resource or use existing one
3. Note down the **Microsoft App ID** and **App Password**
4. Set the messaging endpoint to your bot's URL (e.g., `https://yourdomain.com/api/messages`)

### 4. Azure App Registration

1. Go to [Azure Portal > App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps)
2. Find your bot's App Registration
3. Note down the **Application (client) ID** and **Directory (tenant) ID**

## Usage

### Development

```bash
# Start the bot locally
yarn start
# or
npm start

# The bot will be available at http://localhost:3978
```

### Testing

#### Using Bot Framework Emulator

1. Download [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator/releases)
2. Open the emulator
3. Connect to `http://localhost:3978/api/messages`
4. Start chatting with your bot

#### Using Teams

1. Add your bot to Teams via the Azure Bot resource
2. Start a conversation with your bot
3. Send messages and see responses

### Production Deployment

1. Deploy your bot to a cloud service (Azure, AWS, etc.)
2. Update the messaging endpoint in Azure Bot resource
3. Set environment variables in your hosting platform
4. Ensure HTTPS is enabled

## Project Structure

```
MSTeamsBot/
├── index.js              # Main bot server file
├── test_credentials.js   # Credential testing utility
├── bots/                 # Bot logic modules
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create this)
└── README.md            # This file
```

## Configuration

### Bot Framework Adapter

The bot uses `BotFrameworkAdapter` with Single Tenant authentication:

```javascript
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD,
  tenantId: process.env.MICROSOFT_APP_TENANT_ID
});
```

### Message Handling

The bot currently handles:
- **Message activities**: Echoes back user messages
- **Conversation updates**: Welcomes new members
- **Error handling**: Graceful error responses

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify your App ID, Password, and Tenant ID
   - Ensure the bot is registered in the correct Azure tenant
   - Check that the App Registration exists and is properly configured

2. **Port Issues**
   - Ensure port 3978 is available
   - Use `PORT` environment variable to change the port

3. **Node Version Issues**
   - Use Node.js 18+ (Bot Framework requirement)
   - Run `nvm use 18` if you have multiple Node versions

### Testing Credentials

Run the credential test to verify your Azure configuration:

```bash
node test_credentials.js
```

## Integration with Qurieus

This bot can be integrated with your main Qurieus application by:

1. **Adding channel information** to message payloads
2. **Connecting to your backend API** for document queries
3. **Implementing your business logic** in the message handlers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Qurieus application suite.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Azure Bot Framework documentation
- Contact the development team

import dotenv from 'dotenv';
dotenv.config();
import { MicrosoftAppCredentials } from 'botframework-connector';

async function testCredentials (): Promise<void> {
  try {
    const credentials = new MicrosoftAppCredentials(
      process.env.MICROSOFT_APP_ID as string,
      process.env.MICROSOFT_APP_PASSWORD as string,
      process.env.MICROSOFT_APP_TENANT_ID as string
    );
    await credentials.getToken(true); // true to force refresh if needed
  } catch (error: unknown) {
    void error;
  }
}

testCredentials();

import dotenv from 'dotenv';
dotenv.config();
import { MicrosoftAppCredentials } from 'botframework-connector';

async function testCredentials (): Promise<void> {
  console.log('Testing credentials...');
  console.log('APP_ID:', process.env.MICROSOFT_APP_ID);
  console.log('APP_PASSWORD:', process.env.MICROSOFT_APP_PASSWORD);

  try {
    const credentials = new MicrosoftAppCredentials(
      process.env.MICROSOFT_APP_ID as string,
      process.env.MICROSOFT_APP_PASSWORD as string,
      process.env.MICROSOFT_APP_TENANT_ID as string
    );
    const token = await credentials.getToken(true); // true to force refresh if needed
    console.log(
      'Access Token acquired successfully: (truncated)',
      token ? token.substring(0, 30) + '...' : 'No token'
    );
    console.log('Test successful!');
  } catch (error: any) {
    console.error('Error during credential test:', error);
    console.error('Stack Trace:', error.stack);
  }
}

testCredentials();

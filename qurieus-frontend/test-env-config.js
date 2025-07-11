// Test script to verify environment variable configuration
require('dotenv').config();

console.log('Environment Variables Test:');
console.log('CHROMIUM_EXECUTABLE_PATH:', process.env.CHROMIUM_EXECUTABLE_PATH);
console.log('Fallback path: /usr/bin/chromium-browser');
console.log('Final path to use:', process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium-browser');

// Test Puppeteer import and configuration
const puppeteer = require('puppeteer');

async function testConfig() {
  try {
    console.log('\nTesting Puppeteer with environment variable...');
    
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    console.log('✅ Browser launched successfully with env config!');
    console.log('✅ Using executable path:', process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium-browser');
    
    await browser.close();
    console.log('✅ Browser closed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConfig(); 
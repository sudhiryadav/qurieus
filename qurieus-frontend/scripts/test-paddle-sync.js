const axios = require('axios');

// Test script for Paddle sync functionality
async function testPaddleSync() {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  console.log('Testing Paddle sync functionality...');
  console.log('Base URL:', baseURL);
  
  try {
    // Test 1: Check if the sync endpoint exists
    console.log('\n1. Testing sync endpoint availability...');
    const response = await axios.post(`${baseURL}/api/admin/subscription-plans/sync-paddle-ids`, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on any status
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.status === 401) {
      console.log('✅ Endpoint exists but requires authentication (expected)');
    } else if (response.status === 200) {
      console.log('✅ Sync completed successfully');
      console.log('Results:', response.data.results);
    } else {
      console.log('❌ Unexpected response:', response.status, response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing sync:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPaddleSync().catch(console.error); 
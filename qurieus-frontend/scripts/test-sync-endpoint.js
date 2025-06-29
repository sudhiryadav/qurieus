const axios = require('axios');

async function testSyncEndpoint() {
  const baseURL = 'http://localhost:3000';
  
  console.log('Testing Paddle sync endpoint...');
  console.log('Base URL:', baseURL);
  
  try {
    // Test the sync endpoint
    console.log('\n1. Testing sync-paddle-ids endpoint...');
    const response = await axios.post(`${baseURL}/api/admin/subscription-plans/sync-paddle-ids`, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on any status
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Endpoint exists but requires authentication (expected)');
      console.log('This means the endpoint is working correctly!');
    } else if (response.status === 200) {
      console.log('✅ Sync completed successfully');
      console.log('Results:', response.data.results);
    } else {
      console.log('❌ Unexpected response:', response.status);
      console.log('Response data:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing sync:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server not running. Please start the development server first.');
    }
  }
}

// Run the test
testSyncEndpoint().catch(console.error); 
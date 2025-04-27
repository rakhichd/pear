// Test the Claude API to ensure it's working properly
require('dotenv').config({ path: '.env.local' });

const Anthropic = require('@anthropic-ai/sdk');

// Function to test the Claude API
async function testClaude() {
  console.log('🧠 Testing the Claude API connection...');
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set in .env.local');
    console.log('Please add your API key to the .env.local file:');
    console.log('ANTHROPIC_API_KEY=your_api_key_here');
    return;
  }
  
  try {
    // Initialize the Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    console.log('Sending a test message to Claude...');
    
    // Make a simple API call
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',  // Update this if you get model not found errors
      max_tokens: 100,
      temperature: 0.2,
      messages: [
        { role: 'user', content: 'Give 3 key tips for a great software engineer resume in JSON format.' }
      ],
    });
    
    // Print the response
    console.log('✅ Claude API is working!');
    console.log('Response:');
    console.log(response.content[0].text);
    
  } catch (error) {
    console.error('❌ Error connecting to Claude API:', error.message);
    if (error.status === 401) {
      console.log('API key appears to be invalid or expired');
    }
    console.log('Please check your API key in .env.local');
  }
}

// Run the test
testClaude();
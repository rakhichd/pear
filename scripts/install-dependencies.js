// This script ensures all the required dependencies are installed
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Installing dependencies for the resume feedback feature...');
  
  // Install packages needed for PDF processing and Claude API
  const dependencies = [
    '@anthropic-ai/sdk',
    'pdf-parse',
    'form-data',
    'node-fetch'
  ];
  
  // Check if each dependency is already installed
  dependencies.forEach(dep => {
    try {
      require.resolve(dep);
      console.log(`✓ ${dep} is already installed`);
    } catch (e) {
      console.log(`Installing ${dep}...`);
      execSync(`npm install ${dep}`, { stdio: 'inherit' });
    }
  });
  
  // Create .env.local file if it doesn't exist
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('Creating .env.local file template...');
    fs.writeFileSync(
      envPath,
      '# Anthropic API Key for Claude\n' +
      'ANTHROPIC_API_KEY=your_api_key_here\n'
    );
    console.log('Please edit .env.local and add your Anthropic API key');
  }
  
  console.log('All dependencies installed successfully!');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}
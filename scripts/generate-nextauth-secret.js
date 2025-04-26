const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

// Generate a random string for NextAuth secret
function generateRandomSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

// Update the .env file with the new secret
function updateEnvFile(secret) {
  try {
    const envPath = '.env';
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the placeholder with the generated secret
    const updatedContent = envContent.replace(
      /NEXTAUTH_SECRET=.*$/m,
      `NEXTAUTH_SECRET=${secret}`
    );
    
    fs.writeFileSync(envPath, updatedContent);
    console.log('Updated NEXTAUTH_SECRET in .env file');
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
}

// Main function
function main() {
  const secret = generateRandomSecret();
  console.log('Generated NextAuth secret:', secret);
  updateEnvFile(secret);
}

main(); 
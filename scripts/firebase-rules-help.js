// Firebase Rules Helper
require('dotenv').config();

function printFirebaseHelp() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  console.log('\n=====================================');
  console.log('FIREBASE SECURITY RULES INSTRUCTIONS');
  console.log('=====================================\n');
  
  console.log(`Your Firebase Project ID: ${projectId || 'Not found in .env'}`);
  
  console.log('\nTo update your Firestore security rules:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log(`2. Select your project: ${projectId || 'your-project'}`);
  console.log('3. In the left sidebar, click on "Firestore Database"');
  console.log('4. Click on the "Rules" tab');
  console.log('5. Update your rules to allow authenticated users to read/write data:\n');
  
  console.log(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Allow read/write access to authenticated users
      allow read, write: if request.auth != null;
      
      // Alternative: Allow public read, authenticated write
      // allow read: if true;
      // allow write: if request.auth != null;
    }
  }
}`);
  
  console.log('\nAfter updating your rules, click "Publish" to save the changes.');
  console.log('\nNote: These are permissive rules for testing. For production,');
  console.log('you should restrict access based on your application\'s needs.');
}

printFirebaseHelp(); 
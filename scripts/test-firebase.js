// Simple script to test Firebase connection
require('dotenv').config(); // Load environment variables

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  // Firebase configuration from environment variables
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
    
    // Initialize Firestore
    const db = getFirestore(app);
    console.log('Firestore initialized successfully');
    
    // Try to access a collection (this will succeed even if the collection doesn't exist)
    const testCollectionRef = collection(db, 'test_collection');
    console.log('Successfully referenced a Firestore collection');
    
    // Try to get documents (will not error even if empty)
    const querySnapshot = await getDocs(testCollectionRef);
    console.log(`Successfully queried Firestore. Found ${querySnapshot.size} documents.`);
    
    console.log('✅ Firebase connection test passed!');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}

// Run the test
testFirebaseConnection()
  .then(result => {
    if (!result) process.exit(1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 
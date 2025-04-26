// Detailed Firebase connection test
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInAnonymously, onAuthStateChanged } = require('firebase/auth');

async function testFirebaseConnection() {
  console.log('Starting detailed Firebase connection test...');
  
  // Firebase configuration
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
    // Step 1: Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');
    
    // Step 2: Initialize Firestore
    const db = getFirestore(app);
    console.log('✅ Firestore initialized successfully');
    
    // Step 3: Initialize Auth
    const auth = getAuth(app);
    console.log('✅ Firebase Auth initialized successfully');

    // Step 4: Try anonymous auth
    console.log('Attempting anonymous authentication...');
    try {
      const userCredential = await signInAnonymously(auth);
      console.log('✅ Anonymous authentication successful:', userCredential.user.uid);
    } catch (authError) {
      console.error('❌ Anonymous authentication failed:', authError.message);
      console.log('    This could mean anonymous auth is disabled in your Firebase project.');
    }
    
    // Step 5: Check current auth state
    console.log('Current authentication state:');
    if (auth.currentUser) {
      console.log(`  - User is signed in with UID: ${auth.currentUser.uid}`);
    } else {
      console.log('  - No user is currently signed in');
    }
    
    // Step 6: Try to access Firestore with current permissions
    console.log('\nAttempting Firestore access...');
    try {
      const testCollectionRef = collection(db, 'test_collection');
      const querySnapshot = await getDocs(testCollectionRef);
      console.log(`✅ Successfully queried Firestore. Found ${querySnapshot.size} documents.`);
      
      // Log some details if we have documents
      if (querySnapshot.size > 0) {
        console.log('Document IDs:');
        querySnapshot.forEach(doc => {
          console.log(`  - ${doc.id}`);
        });
      }
    } catch (firestoreError) {
      console.error('❌ Firestore access failed with error:', firestoreError.message);
      
      if (firestoreError.code === 'permission-denied') {
        console.log('\nPERMISSION DENIED TROUBLESHOOTING:');
        console.log('1. Check your Firestore security rules in the Firebase Console');
        console.log('2. Make sure your security rules allow the current user to access the "test_collection"');
        console.log('3. Example rules to allow authenticated access:');
        console.log(`
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
        `);
      }
    }
    
    console.log('\nFirebase connection test complete');
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
  }
}

// Run the test
testFirebaseConnection(); 
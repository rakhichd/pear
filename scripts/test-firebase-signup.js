// Firebase signup test
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

async function testFirebaseSignup() {
  console.log('Testing Firebase signup...');
  
  // Generate a random test email to avoid duplicates
  const randomSuffix = Math.floor(Math.random() * 100000);
  const testEmail = `test-user-${randomSuffix}@example.com`;
  const testPassword = 'TestPassword123!';
  
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
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');
    
    // Initialize Auth
    const auth = getAuth(app);
    console.log('✅ Firebase Auth initialized successfully');
    
    // Try to create a new user
    console.log(`Attempting to create user with email: ${testEmail}`);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;
      console.log('✅ User created successfully!');
      console.log(`  - User UID: ${user.uid}`);
      console.log(`  - User Email: ${user.email}`);
      
      // Now that we're authenticated, try to access Firestore
      console.log('\nTesting Firestore access with authenticated user...');
      const db = getFirestore(app);
      
      try {
        const testCollectionRef = collection(db, 'test_collection');
        const querySnapshot = await getDocs(testCollectionRef);
        console.log(`✅ Successfully queried Firestore. Found ${querySnapshot.size} documents.`);
      } catch (firestoreError) {
        console.error('❌ Firestore access failed with error:', firestoreError.message);
        
        if (firestoreError.code === 'permission-denied') {
          console.log('\nPERMISSION DENIED: Even with authentication, you need proper security rules.');
          console.log('Update your Firestore security rules to allow authenticated users to access data.');
        }
      }
      
      // Clean up by signing out
      await signOut(auth);
      console.log('\n✅ Successfully signed out test user');
      
    } catch (authError) {
      console.error('❌ User creation failed:', authError.message);
      
      if (authError.code === 'auth/email-already-in-use') {
        console.log('  - This email is already in use. The authentication system is working!');
        console.log('  - Try running the script again (a random email will be generated)');
      } else if (authError.code === 'auth/operation-not-allowed') {
        console.log('  - Email/password authentication is not enabled in your Firebase project.');
        console.log('  - Enable it in the Firebase Console: Authentication > Sign-in method');
      }
    }
    
    console.log('\nFirebase signup test complete');
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

// Run the test
testFirebaseSignup(); 
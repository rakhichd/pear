require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configure Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const processedDataPath = path.join(__dirname, '../data/resumes/processed_data.json');

// Import a single resume to Firebase
const importSingleResume = async (resume, index, total) => {
  try {
    console.log(`[${index+1}/${total}] Uploading resume ${resume.id}...`);
    
    const resumeRef = doc(db, 'resumes', resume.id);
    await setDoc(resumeRef, {
      ...resume,
      lastUpdated: serverTimestamp()
    });
    
    console.log(`[${index+1}/${total}] Resume ${resume.id} uploaded successfully`);
    return true;
  } catch (error) {
    console.error(`[${index+1}/${total}] Error uploading resume ${resume.id}:`, error.message);
    
    // Log specific information about the error
    if (error.code === 'permission-denied') {
      console.error('Firebase permission denied. Check your security rules.');
    } else if (error.code === 'unavailable') {
      console.error('Firebase service unavailable. Check your internet connection or Firebase status.');
    } else if (error.code === 'resource-exhausted') {
      console.error('Firebase quota exceeded. Try again later.');
    }
    
    return false;
  }
};

// Import resumes to Firebase sequentially
const importToFirebaseSequentially = async () => {
  try {
    // Load the processed data from file
    console.log('Loading processed resume data...');
    if (!fs.existsSync(processedDataPath)) {
      throw new Error('Processed data file not found. Please run the full import script first to process the CSV.');
    }
    
    const resumesData = JSON.parse(fs.readFileSync(processedDataPath, 'utf8'));
    console.log(`Loaded ${resumesData.length} resumes from processed data file`);
    
    // Limit to first 5 resumes for testing
    const limitedData = resumesData.slice(0, 5);
    console.log(`Testing with first ${limitedData.length} resumes`);
    
    // Import sequentially
    let successCount = 0;
    for (let i = 0; i < limitedData.length; i++) {
      const success = await importSingleResume(limitedData[i], i, limitedData.length);
      if (success) {
        successCount++;
      }
      // Add a small delay between requests to avoid overwhelming Firebase
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Import completed: ${successCount}/${limitedData.length} resumes uploaded successfully`);
    return true;
  } catch (error) {
    console.error('Error importing resumes to Firebase:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('Starting Firebase sequential import...');
    await importToFirebaseSequentially();
    console.log('Process completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
};

// Run the import
main(); 
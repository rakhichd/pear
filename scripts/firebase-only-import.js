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

// Import resumes to Firebase only
const importToFirebase = async () => {
  try {
    // Load the processed data from file
    console.log('Loading processed resume data...');
    if (!fs.existsSync(processedDataPath)) {
      throw new Error('Processed data file not found. Please run the full import script first to process the CSV.');
    }
    
    const resumesData = JSON.parse(fs.readFileSync(processedDataPath, 'utf8'));
    console.log(`Loaded ${resumesData.length} resumes from processed data file`);
    
    const batchSize = 20;
    const totalBatches = Math.ceil(resumesData.length / batchSize);
    
    // Process in batches
    for (let i = 0; i < resumesData.length; i += batchSize) {
      const batch = resumesData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      console.log(`Processing batch ${batchNumber}/${totalBatches}...`);
      
      // Prepare Firebase promises
      const firebasePromises = batch.map(resume => {
        const resumeRef = doc(db, 'resumes', resume.id);
        return setDoc(resumeRef, {
          ...resume,
          lastUpdated: serverTimestamp()
        });
      });
      
      // Execute uploads
      try {
        console.log(`Uploading batch ${batchNumber} to Firebase...`);
        await Promise.all(firebasePromises);
        console.log(`Firebase upload for batch ${batchNumber} completed successfully`);
      } catch (firebaseError) {
        console.error(`Error uploading batch ${batchNumber} to Firebase:`, firebaseError);
        if (firebaseError.code === 'permission-denied') {
          console.error('Firebase permission denied. Make sure you have enabled Firestore API and have proper permissions.');
          throw firebaseError; // Stop execution if we don't have permissions
        }
      }
    }
    
    console.log('All data uploaded to Firebase successfully');
    return true;
  } catch (error) {
    console.error('Error importing resumes to Firebase:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('Starting Firebase-only import...');
    await importToFirebase();
    console.log('Import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
};

// Run the import
main(); 
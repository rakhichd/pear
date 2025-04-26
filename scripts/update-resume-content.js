require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

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

const resumesPath = path.join(__dirname, '../data/resumes/Resume.csv');

// Create a mapping from ID to Resume content
const createContentMapping = () => {
  return new Promise((resolve, reject) => {
    console.log('Reading resume content from CSV...');
    
    if (!fs.existsSync(resumesPath)) {
      return reject(new Error(`File not found: ${resumesPath}`));
    }
    
    const contentMap = {};
    
    fs.createReadStream(resumesPath)
      .pipe(csv())
      .on('data', (data) => {
        if (data.ID && data.Resume_str) {
          contentMap[data.ID] = data.Resume_str;
        }
      })
      .on('end', () => {
        console.log(`Created content mapping for ${Object.keys(contentMap).length} resumes`);
        resolve(contentMap);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Update content for a single resume
const updateResumeContent = async (resumeId, content) => {
  try {
    // Check if resume exists
    const originalId = resumeId.replace('kaggle-', '');
    const firestoreId = `kaggle-${originalId}`;
    
    const resumeRef = doc(db, 'resumes', firestoreId);
    const resumeSnapshot = await getDoc(resumeRef);
    
    if (!resumeSnapshot.exists()) {
      console.log(`Resume ${firestoreId} not found in Firestore, skipping`);
      return false;
    }
    
    // Update only the content field
    await updateDoc(resumeRef, {
      content: content
    });
    
    console.log(`Updated content for resume ${firestoreId}`);
    return true;
  } catch (error) {
    console.error(`Error updating resume ${resumeId}:`, error);
    return false;
  }
};

// Main function
const updateResumeContents = async () => {
  try {
    // Create mapping from ID to content
    const contentMap = await createContentMapping();
    
    console.log(`Found ${Object.keys(contentMap).length} resumes with content`);
    
    // Update each resume
    let successCount = 0;
    let failureCount = 0;
    
    for (const [id, content] of Object.entries(contentMap)) {
      console.log(`Updating resume ${id} (${successCount + failureCount + 1}/${Object.keys(contentMap).length})...`);
      
      const success = await updateResumeContent(id, content);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      // Add a small delay to avoid overwhelming Firebase
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Log progress periodically
      if ((successCount + failureCount) % 20 === 0) {
        console.log(`Progress: ${successCount + failureCount}/${Object.keys(contentMap).length} (Success: ${successCount}, Failed: ${failureCount})`);
      }
    }
    
    console.log(`Completed updating resume contents:`);
    console.log(`- Total: ${Object.keys(contentMap).length}`);
    console.log(`- Successfully updated: ${successCount}`);
    console.log(`- Failed to update: ${failureCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating resume contents:', error);
    process.exit(1);
  }
};

// Run the update
updateResumeContents(); 
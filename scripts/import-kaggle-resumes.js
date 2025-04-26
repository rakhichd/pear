require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Pinecone } = require('@pinecone-database/pinecone');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');

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

// Configure Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const resumesPath = path.join(__dirname, '../data/resumes/Resume.csv');
const processedDataPath = path.join(__dirname, '../data/resumes/processed_data.json');

// Simple schema for resume data
const standardizeResume = (csvRow, index) => {
  const resumeId = `kaggle-${csvRow.ID || index}`;
  
  // Basic schema with default values if fields are missing
  return {
    id: resumeId,
    title: `${csvRow.Category || 'General'} Resume`,
    category: csvRow.Category || 'General',
    content: csvRow.Resume_str || '',
    source: 'Kaggle Dataset',
    lastUpdated: new Date().toISOString(),
    // Generate a concatenated text for embedding
    textForEmbedding: `Category: ${csvRow.Category || 'General'}\nResume: ${csvRow.Resume_str || ''}`,
  };
};

// Process the CSV file
const processCSV = () => {
  return new Promise((resolve, reject) => {
    console.log('Reading resume data from CSV...');
    
    if (!fs.existsSync(resumesPath)) {
      return reject(new Error(`File not found: ${resumesPath}`));
    }
    
    const processedResumes = [];
    
    fs.createReadStream(resumesPath)
      .pipe(csv())
      .on('data', (data, index) => {
        // Standardize the resume data
        const resumeData = standardizeResume(data, processedResumes.length);
        processedResumes.push(resumeData);
        
        // Log progress
        if (processedResumes.length % 100 === 0) {
          console.log(`Processed ${processedResumes.length} resumes...`);
        }
      })
      .on('end', () => {
        console.log(`Completed processing ${processedResumes.length} resumes`);
        // Save to file for reference
        fs.writeFileSync(processedDataPath, JSON.stringify(processedResumes, null, 2));
        resolve(processedResumes);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Upload to both Firebase and Pinecone
const uploadData = async (resumes) => {
  try {
    // 1. Load Universal Sentence Encoder model
    console.log('Loading embedding model...');
    const model = await use.load();
    console.log('Model loaded successfully');
    
    const batchSize = 20;
    const indexName = process.env.PINECONE_INDEX_NAME || 'resumefind';
    const index = pinecone.Index(indexName);
    
    // Process in batches
    for (let i = 0; i < resumes.length; i += batchSize) {
      const batch = resumes.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(resumes.length/batchSize)}...`);
      
      // Generate embeddings for the batch
      const texts = batch.map(resume => resume.textForEmbedding);
      const embedResults = await model.embed(texts);
      const embeddings = await embedResults.array();
      
      // Prepare promises for Firebase and vectors for Pinecone
      const firebasePromises = [];
      const pineconeVectors = [];
      
      batch.forEach((resume, j) => {
        // Firebase document
        const resumeRef = doc(db, 'resumes', resume.id);
        firebasePromises.push(
          setDoc(resumeRef, {
            ...resume,
            lastUpdated: serverTimestamp()
          })
        );
        
        // Pinecone vector - pad to 1024 dimensions
        const vector = embeddings[j];
        const paddedVector = new Array(1024).fill(0);
        for (let k = 0; k < Math.min(vector.length, 1024); k++) {
          paddedVector[k] = vector[k];
        }
        
        pineconeVectors.push({
          id: resume.id,
          values: paddedVector,
          metadata: {
            title: resume.title,
            category: resume.category,
            content: resume.content.substring(0, 500) // Include a preview of content in metadata
          }
        });
      });
      
      // Execute uploads
      try {
        console.log(`Uploading batch ${Math.floor(i/batchSize) + 1} to Firebase...`);
        await Promise.all(firebasePromises);
        console.log(`Firebase upload for batch ${Math.floor(i/batchSize) + 1} completed successfully`);
      } catch (firebaseError) {
        console.error(`Error uploading to Firebase: ${firebaseError.message}`);
        console.log('Continuing with Pinecone upload...');
      }
      
      console.log(`Uploading batch ${Math.floor(i/batchSize) + 1} to Pinecone...`);
      await index.upsert(pineconeVectors);
      
      console.log(`Completed batch ${Math.floor(i/batchSize) + 1}`);
      
      // Clean up tensor
      embedResults.dispose();
    }
    
    console.log('All data uploaded successfully');
    return true;
  } catch (error) {
    console.error('Error uploading data:', error);
    throw error;
  }
};

// Main function
const importResumes = async () => {
  try {
    // Process the CSV file
    const resumes = await processCSV();
    
    // Upload to Firebase and Pinecone
    await uploadData(resumes);
    
    console.log('Import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error importing resumes:', error);
    process.exit(1);
  }
};

// Run the import
importResumes(); 
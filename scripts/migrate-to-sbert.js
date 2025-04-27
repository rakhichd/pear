/**
 * Migration script for transferring existing resume embeddings to SBERT format
 * 
 * This script reads all resumes from the original Pinecone index, 
 * regenerates embeddings using the SBERT model, and stores them
 * in the new SBERT-specific Pinecone index.
 * 
 * Run with: node scripts/migrate-to-sbert.js
 */

require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { pipeline, env } = require('@xenova/transformers');

// Configure to use WASM backend for better performance
env.backends.onnx.wasm.numThreads = 4;

// Initialize Firebase Admin
let firebaseApp;
try {
  // Get Firebase service account credentials from environment variables
  const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountB64) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable');
  }
  
  // Decode base64-encoded service account JSON
  const serviceAccountJson = Buffer.from(serviceAccountB64, 'base64').toString();
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  // Initialize Firebase Admin app
  firebaseApp = initializeApp({
    credential: cert(serviceAccount)
  });
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

// Get Firestore instance
const db = getFirestore(firebaseApp);

// Pinecone index names
const sourceIndexName = 'pear-resumes';
const targetIndexName = 'pear-resumes-sbert';

// Initialize the SBERT model
let embeddingModel = null;
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

async function getModel() {
  if (!embeddingModel) {
    console.log('Loading SBERT model...');
    
    try {
      // Initialize the feature-extraction pipeline with our model
      embeddingModel = await pipeline('feature-extraction', MODEL_NAME, {
        quantized: true, // Use quantized model for faster inference and smaller size
      });
      
      console.log('SBERT model loaded successfully');
    } catch (error) {
      console.error('Error loading SBERT model:', error);
      throw error;
    }
  }
  
  return embeddingModel;
}

// Generate SBERT embedding for text
async function generateSbertEmbedding(text) {
  try {
    // Ensure model is loaded
    const model = await getModel();
    
    // Generate embedding - SBERT models typically expect input without special tokens
    const result = await model(text, { 
      pooling: 'mean', // Use mean pooling to get fixed-size output
      normalize: true, // Normalize the output (important for cosine similarity search)
    });
    
    // Extract the embedding data
    const embedding = result.data;
    
    // Convert to Float32Array if it's not already
    const vector = Array.isArray(embedding) ? embedding : Array.from(embedding);
    
    // Pad to 1024 dimensions for Pinecone compatibility
    const paddedVector = new Array(1024).fill(0);
    
    // Copy values up to the minimum of original length and 1024
    for (let i = 0; i < Math.min(vector.length, 1024); i++) {
      paddedVector[i] = vector[i];
    }
    
    return paddedVector;
  } catch (error) {
    console.error('Error generating SBERT embedding:', error);
    throw error;
  }
}

// Prepare resume text for embedding
function prepareResumeTextForEmbedding(resumeData) {
  const sections = [];
  
  // Add structured data if available
  if (resumeData.name) sections.push(`Name: ${resumeData.name}`);
  if (resumeData.title) sections.push(`Title: ${resumeData.title}`);
  if (resumeData.summary) sections.push(`Summary: ${resumeData.summary}`);
  
  // Add skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    sections.push(`Skills: ${resumeData.skills.join(', ')}`);
  }
  
  // Add education
  if (resumeData.education) {
    sections.push(`Education: ${resumeData.education}`);
  }
  
  // Add experience
  if (resumeData.experience) {
    sections.push(`Experience: ${resumeData.experience}`);
  }
  
  // Add companies if available
  if (resumeData.companies && resumeData.companies.length > 0) {
    sections.push(`Companies: ${resumeData.companies.join(', ')}`);
  }
  
  // Add raw content if available
  if (resumeData.content) {
    sections.push(`Content: ${resumeData.content}`);
  }
  
  return sections.join('\n');
}

// Migrate embeddings from USE to SBERT
async function migrateEmbeddings() {
  try {
    // Check for API key in environment variables
    const apiKey = process.env.NEXT_PUBLIC_PINECONE_API_KEY;
    
    if (!apiKey) {
      console.error('Missing NEXT_PUBLIC_PINECONE_API_KEY environment variable');
      return;
    }

    // Initialize Pinecone client
    const pc = new Pinecone({
      apiKey,
    });

    console.log('Connected to Pinecone successfully');

    // Check if source and target indexes exist
    const existingIndexes = await pc.listIndexes();
    const sourceIndexExists = existingIndexes.some(index => index.name === sourceIndexName);
    const targetIndexExists = existingIndexes.some(index => index.name === targetIndexName);

    if (!sourceIndexExists) {
      console.error(`Source index '${sourceIndexName}' does not exist.`);
      return;
    }

    if (!targetIndexExists) {
      console.error(`Target index '${targetIndexName}' does not exist. Run setup-pinecone-sbert.js first.`);
      return;
    }

    // Get references to the indexes
    const sourceIndex = pc.index(sourceIndexName);
    const targetIndex = pc.index(targetIndexName);

    // Get all resume IDs from Firestore
    const resumesSnapshot = await db.collection('resumes').get();
    
    console.log(`Found ${resumesSnapshot.size} resumes in Firestore`);
    
    // Batch size for upserts
    const BATCH_SIZE = 10;
    let processed = 0;
    let batches = [];
    let currentBatch = [];

    for (const doc of resumesSnapshot.docs) {
      try {
        const resumeId = doc.id;
        const resumeData = doc.data();
        
        console.log(`Processing resume ${resumeId} (${processed + 1}/${resumesSnapshot.size})`);
        
        // Prepare resume text for embedding
        const resumeText = prepareResumeTextForEmbedding(resumeData);
        
        // Generate SBERT embedding
        const embedding = await generateSbertEmbedding(resumeText);
        
        // Define metadata to store with the vector
        const metadata = {
          name: resumeData.name || '',
          title: resumeData.title || '',
          email: resumeData.email || '',
          date: new Date().toISOString(),
        };

        // Add to current batch
        currentBatch.push({
          id: resumeId,
          values: embedding,
          metadata,
        });
        
        // If batch is full, add to batches array
        if (currentBatch.length >= BATCH_SIZE) {
          batches.push([...currentBatch]);
          currentBatch = [];
        }
        
        processed++;
      } catch (error) {
        console.error(`Error processing resume ${doc.id}:`, error);
      }
    }
    
    // Add remaining items to batches
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    console.log(`Prepared ${processed} resumes in ${batches.length} batches`);
    
    // Upsert batches to target index
    let uploadedCount = 0;
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Upserting batch ${i + 1}/${batches.length} (${batch.length} vectors)`);
      
      try {
        await targetIndex.upsert({ vectors: batch });
        uploadedCount += batch.length;
        console.log(`Batch ${i + 1} upserted successfully`);
      } catch (error) {
        console.error(`Error upserting batch ${i + 1}:`, error);
      }
    }
    
    console.log(`Migration complete: ${uploadedCount}/${processed} vectors migrated successfully`);

  } catch (error) {
    console.error('Error migrating embeddings:', error);
  }
}

// Run the migration function
migrateEmbeddings()
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
/**
 * Setup script for creating Pinecone index for SBERT embeddings
 * 
 * This script initializes a new Pinecone index specifically for 
 * Sentence-BERT embeddings, which have different dimensions
 * than the Universal Sentence Encoder.
 * 
 * Run with: node scripts/setup-pinecone-sbert.js
 */

require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function setupPineconeForSbert() {
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
    
    // Define our index name for SBERT
    const indexName = 'pear-resumes-sbert';

    // Check if the index already exists
    const existingIndexes = await pc.listIndexes();
    const indexExists = existingIndexes.some(index => index.name === indexName);

    if (indexExists) {
      console.log(`Index '${indexName}' already exists.`);
      return;
    }

    // Create a new index for SBERT embeddings
    console.log(`Creating new index '${indexName}'...`);
    
    await pc.createIndex({
      name: indexName,
      dimension: 1024, // Match the dimension in our code
      metric: 'cosine', // Use cosine similarity for comparing embeddings
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-west-2',
        },
      }
    });

    console.log(`Index '${indexName}' created successfully.`);

  } catch (error) {
    console.error('Error setting up Pinecone:', error);
  }
}

// Run the setup function
setupPineconeForSbert()
  .then(() => {
    console.log('Setup complete');
  })
  .catch((err) => {
    console.error('Setup failed:', err);
  });
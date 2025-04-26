require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

async function setupPineconeIndex() {
  try {
    // Initialize Pinecone client with only the API key
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // Check if the index already exists
    const indexes = await pinecone.listIndexes();
    const indexName = process.env.PINECONE_INDEX_NAME || 'resumefind';
    const indexExists = indexes.indexes && indexes.indexes.some(index => index.name === indexName);

    if (indexExists) {
      console.log(`Index "${indexName}" already exists`);
      console.log(`Host: ${process.env.PINECONE_HOST}`);
      return;
    } else {
      console.log(`Index "${indexName}" doesn't exist yet. Creating it...`);
    }

    // Create a new index if it doesn't exist
    console.log(`Creating index "${indexName}"...`);
    await pinecone.createIndex({
      name: indexName,
      dimension: 1024, // Updated dimension size
      metric: 'cosine',
    });

    console.log(`Successfully created index "${indexName}"`);
  } catch (error) {
    console.error('Error setting up Pinecone index:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the setup function
setupPineconeIndex(); 
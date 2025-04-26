require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');

// Configure Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Test queries to search for
const testQueries = [
  "Software engineer with React and Node.js experience",
  "Data scientist with machine learning skills",
  "Product manager with agile experience",
  "UX/UI designer with Figma skills",
  "Java developer with Spring Boot experience"
];

async function testPineconeSearch() {
  try {
    console.log('Loading Universal Sentence Encoder model...');
    const model = await use.load();
    console.log('Model loaded successfully');
    
    // Connect to Pinecone index
    const indexName = process.env.PINECONE_INDEX_NAME || 'resumefind';
    const index = pinecone.Index(indexName);
    
    // Get stats from the index to verify data is there
    const stats = await index.describeIndexStats();
    console.log(`\nPinecone index stats:`);
    console.log(`Total vectors: ${stats.totalVectorCount || 'Unknown'}`);
    console.log(`Namespaces: ${Object.keys(stats.namespaces || {}).join(', ') || 'default'}`);
    
    console.log('\n--- Testing Resume Searches ---');
    
    // Test each query
    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      
      // Generate embedding for the query
      const queryEmbedding = await model.embed([query]);
      const queryVector = await queryEmbedding.array();
      
      // Prepare the vector for Pinecone (pad to 1024 dimensions)
      const paddedVector = new Array(1024).fill(0);
      for (let i = 0; i < Math.min(queryVector[0].length, 1024); i++) {
        paddedVector[i] = queryVector[0][i];
      }
      
      try {
        // Query Pinecone for similar resumes
        const queryResponse = await index.query({
          vector: paddedVector,
          topK: 3,
          includeMetadata: true
        });
        
        // Display results
        console.log(`Found ${queryResponse.matches.length} matching resumes:`);
        
        if (queryResponse.matches.length === 0) {
          console.log('No matches found.');
        } else {
          queryResponse.matches.forEach((match, i) => {
            // Safely access metadata properties
            const metadata = match.metadata || {};
            
            console.log(`\n${i + 1}. ID: ${match.id}`);
            console.log(`   Score: ${match.score.toFixed(4)}`);
            console.log(`   Title: ${metadata.title || 'N/A'}`);
            console.log(`   Category: ${metadata.category || 'N/A'}`);
            
            // Safely access content
            if (metadata.content) {
              console.log(`   Content Preview: ${metadata.content.substring(0, 100)}...`);
            } else {
              console.log(`   Content Preview: N/A`);
            }
          });
        }
      } catch (queryError) {
        console.error(`Error querying for "${query}":`, queryError.message);
      }
      
      // Clean up tensor
      queryEmbedding.dispose();
    }
    
    console.log('\nPinecone search test completed successfully');
  } catch (error) {
    console.error('Error testing Pinecone search:', error);
    process.exit(1);
  }
}

testPineconeSearch(); 
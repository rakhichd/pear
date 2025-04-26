require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');

// Sample resume data
const sampleResumes = [
  {
    id: 'resume1',
    title: 'Software Engineer Resume',
    summary: 'Experienced software engineer with expertise in React, Node.js, and cloud services.',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    education: 'B.S. Computer Science, Stanford University',
    experience: '5 years at tech companies',
    companies: ['Google', 'Microsoft']
  },
  {
    id: 'resume2',
    title: 'Data Scientist Resume',
    summary: 'Data scientist with strong machine learning and statistical analysis skills.',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
    education: 'M.S. Data Science, MIT',
    experience: '3 years in data science roles',
    companies: ['Amazon', 'Netflix']
  },
  {
    id: 'resume3',
    title: 'Product Manager Resume',
    summary: 'Product manager focused on user experience and product strategy.',
    skills: ['Product Strategy', 'User Research', 'Agile', 'Analytics'],
    education: 'MBA, Harvard Business School',
    experience: '4 years of product management',
    companies: ['Apple', 'Meta']
  }
];

// Function to prepare resume text for embedding
function prepareResumeText(resumeData) {
  const parts = [];
  
  if (resumeData.title) parts.push(`Title: ${resumeData.title}`);
  if (resumeData.summary) parts.push(`Summary: ${resumeData.summary}`);
  
  if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    parts.push(`Skills: ${resumeData.skills.join(', ')}`);
  }
  
  if (resumeData.education) {
    parts.push(`Education: ${resumeData.education}`);
  }
  
  if (resumeData.experience) {
    parts.push(`Experience: ${resumeData.experience}`);
  }
  
  if (Array.isArray(resumeData.companies) && resumeData.companies.length > 0) {
    parts.push(`Companies: ${resumeData.companies.join(', ')}`);
  }
  
  return parts.join('\n');
}

async function testPinecone() {
  try {
    // Initialize Pinecone client with just API key
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    const indexName = process.env.PINECONE_INDEX_NAME || 'resumefind';
    
    // Get index info to check if it exists
    const indexes = await pinecone.listIndexes();
    console.log('Available indexes:', indexes);
    
    // Connect to index
    const index = pinecone.Index(indexName);
    
    console.log(`Connected to Pinecone index: ${indexName}`);
    console.log(`Host: ${process.env.PINECONE_HOST}`);
    
    // Load the Universal Sentence Encoder model
    console.log('Loading Universal Sentence Encoder model...');
    // Use the standard model - we'll pad the vectors to 1024 later
    const model = await use.load();
    console.log('Model loaded');
    
    // Generate embeddings for sample resumes
    const embeddings = [];
    for (const resume of sampleResumes) {
      const resumeText = prepareResumeText(resume);
      console.log(`Generating embedding for resume: ${resume.id}`);
      
      const embedResult = await model.embed(resumeText);
      const embedding = await embedResult.array();
      
      // Pad or truncate the embedding to match the 1024 dimension requirement
      const paddedValues = new Array(1024).fill(0);
      const originalValues = Array.from(embedding[0]);
      
      // Copy values up to the minimum of original length and 1024
      for (let i = 0; i < Math.min(originalValues.length, 1024); i++) {
        paddedValues[i] = originalValues[i];
      }
      
      embeddings.push({
        id: resume.id,
        values: paddedValues,
        metadata: {
          title: resume.title,
          skills: resume.skills,
          education: resume.education,
          companies: resume.companies
        }
      });
      embedResult.dispose(); // Clean up tensor
    }
    
    // Upsert embeddings to Pinecone
    console.log('Upserting embeddings to Pinecone...');
    await index.upsert(embeddings);
    console.log('Successfully upserted embeddings');
    
    // Test a search query
    console.log('Testing search query for "machine learning engineer"...');
    const queryText = 'machine learning engineer';
    const queryEmbedding = await model.embed(queryText);
    const queryVector = await queryEmbedding.array();
    
    // Pad or truncate the query vector to match 1024 dimensions
    const paddedQueryVector = new Array(1024).fill(0);
    const originalQueryVector = Array.from(queryVector[0]);
    
    for (let i = 0; i < Math.min(originalQueryVector.length, 1024); i++) {
      paddedQueryVector[i] = originalQueryVector[i];
    }
    
    queryEmbedding.dispose(); // Clean up tensor
    
    const searchResults = await index.query({
      vector: paddedQueryVector,
      topK: 3,
      includeMetadata: true,
    });
    
    console.log('Search results:');
    console.log(JSON.stringify(searchResults, null, 2));
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error testing Pinecone:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
  }
}

// Run the test function
testPinecone(); 
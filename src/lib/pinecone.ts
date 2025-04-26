import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from '@/utils/embeddings';

// Create a client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

// Connect to index
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || 'resumefind');

export async function searchResumes(query: string, filterParams: any = {}, limit: number = 10) {
  try {
    // 1. Convert the query text to an embedding vector using our embedding model
    const queryEmbedding = await generateEmbedding(query);
    
    // 2. Prepare filter if needed
    const filter = Object.keys(filterParams).length > 0 ? filterParams : undefined;
    
    // 3. Use the embedding vector to search Pinecone
    const queryResponse = await index.query({
      vector: Array.from(queryEmbedding),
      topK: limit,
      filter,
      includeMetadata: true,
    });
    
    return queryResponse;
  } catch (error) {
    console.error('Error searching resumes:', error);
    throw error;
  }
}

export async function indexResume(resumeId: string, resumeData: any, resumeText: string) {
  try {
    // 1. Generate embedding for the resume text
    const contentVector = await generateEmbedding(resumeText);
    
    // 2. Upsert the document with its vector into Pinecone
    await index.upsert([{
      id: resumeId,
      values: Array.from(contentVector),
      metadata: resumeData,
    }]);
    
    return { success: true };
  } catch (error) {
    console.error('Error indexing resume:', error);
    throw error;
  }
}

export async function deleteResumeFromIndex(resumeId: string) {
  try {
    // Delete the document from Pinecone
    await index.deleteOne(resumeId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting resume from index:', error);
    throw error;
  }
}

export default pinecone; 
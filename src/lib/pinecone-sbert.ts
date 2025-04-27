/**
 * Pinecone integration with SBERT embeddings
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { db, storage } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generateSbertEmbedding } from '../utils/sbert-embeddings';
import { prepareResumeTextForEmbedding, processSearchQuery } from '../utils/textProcessing';

// Initialize Pinecone client with error handling
let pineconeClient: Pinecone | null = null;
let pineconeIndex: any = null;
const indexName = 'pear-resumes-sbert';

/**
 * Initialize Pinecone with environment variables
 */
export async function initPinecone() {
  if (pineconeClient) return pineconeClient;

  try {
    const apiKey = process.env.NEXT_PUBLIC_PINECONE_API_KEY;
    if (!apiKey) {
      console.warn('Pinecone API key not found! Skipping Pinecone initialization.');
      return null;
    }

    // Create Pinecone instance
    pineconeClient = new Pinecone({
      apiKey,
    });

    // Check if our index exists
    const indexList = await pineconeClient.listIndexes();
    let indexExists = indexList.some(idx => idx.name === indexName);

    if (!indexExists) {
      console.warn(`Pinecone index "${indexName}" not found. Vector search functionality will be limited.`);
      return pineconeClient;
    }

    // Get reference to our index
    pineconeIndex = pineconeClient.index(indexName);
    console.log('Pinecone SBERT index initialized successfully');

    return pineconeClient;
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    return null;
  }
}

/**
 * Search for resumes using SBERT embeddings
 * @param query User search query
 * @param limit Maximum number of results to return
 * @returns Matched resume IDs with scores
 */
export async function searchResumesSbert(query: string, limit: number = 10) {
  try {
    await initPinecone();
    
    if (!pineconeIndex) {
      console.warn('Pinecone index not available. Returning empty results.');
      return [];
    }

    // Process and prepare search query
    const processedQuery = processSearchQuery(query);
    
    // Generate embedding for the search query
    const queryEmbedding = await generateSbertEmbedding(processedQuery);
    
    // Query Pinecone for similar vectors
    const queryResult = await pineconeIndex.query({
      vector: Array.from(queryEmbedding),
      topK: limit,
      includeMetadata: true,
    });

    // Return matches with their scores
    return queryResult.matches.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    }));
  } catch (error) {
    console.error('Error searching resumes with SBERT:', error);
    return [];
  }
}

/**
 * Index a resume with SBERT embeddings in Pinecone
 * @param resumeId The ID of the resume to index
 */
export async function indexResumeSbert(resumeId: string) {
  try {
    await initPinecone();
    
    if (!pineconeIndex) {
      console.warn('Pinecone index not available. Skipping resume indexing.');
      return;
    }

    // Get resume data from Firestore
    const resumeDoc = await getDoc(doc(db, 'resumes', resumeId));
    
    if (!resumeDoc.exists()) {
      console.error(`Resume ${resumeId} not found in Firestore`);
      return;
    }

    const resumeData = resumeDoc.data();
    
    // Prepare resume text for embedding
    const resumeText = prepareResumeTextForEmbedding(resumeData);
    
    // Generate embedding for the resume
    const embedding = await generateSbertEmbedding(resumeText);
    
    // Define metadata to store with the vector
    const metadata = {
      name: resumeData.name || '',
      title: resumeData.title || '',
      email: resumeData.email || '',
      date: new Date().toISOString(),
    };

    // Upsert the embedding into Pinecone
    await pineconeIndex.upsert({
      vectors: [
        {
          id: resumeId,
          values: Array.from(embedding),
          metadata,
        },
      ],
    });

    console.log(`Indexed resume ${resumeId} in Pinecone with SBERT`);
  } catch (error) {
    console.error('Error indexing resume with SBERT:', error);
  }
}

/**
 * Delete a resume from the Pinecone index
 * @param resumeId The ID of the resume to delete
 */
export async function deleteResumeFromSbertIndex(resumeId: string) {
  try {
    await initPinecone();
    
    if (!pineconeIndex) {
      console.warn('Pinecone index not available. Skipping resume deletion.');
      return;
    }

    // Delete the vector from Pinecone
    await pineconeIndex.delete1({
      ids: [resumeId],
    });

    console.log(`Deleted resume ${resumeId} from Pinecone SBERT index`);
  } catch (error) {
    console.error('Error deleting resume from SBERT index:', error);
  }
}
/**
 * Sentence-BERT (SBERT) embeddings implementation using Transformers.js
 * This provides more powerful semantic search capabilities than the Universal Sentence Encoder
 */

import { pipeline, env } from '@xenova/transformers';

// Configure to use WASM backend for better performance
env.backends.onnx.wasm.numThreads = 4;

// Cache the model for reuse
let embeddingModel: any = null;
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'; // Lightweight, high-quality SBERT model

/**
 * Loads the Sentence-BERT model if not already loaded
 */
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

/**
 * Generate embeddings for a single text using SBERT
 * @param text The text to generate embeddings for
 * @returns A Float32Array embedding vector
 */
export async function generateSbertEmbedding(text: string): Promise<Float32Array> {
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
    const vector = Array.isArray(embedding) ? new Float32Array(embedding) : embedding;
    
    // Pad to 1024 dimensions for Pinecone compatibility
    const paddedVector = new Float32Array(1024);
    
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

/**
 * Generate embeddings for multiple texts using SBERT
 * @param texts Array of texts to generate embeddings for
 * @returns Array of Float32Array embedding vectors
 */
export async function generateSbertEmbeddings(texts: string[]): Promise<Float32Array[]> {
  try {
    // Process each text individually since SBERT models have a max token limit
    const embeddings = await Promise.all(
      texts.map(text => generateSbertEmbedding(text))
    );
    
    return embeddings;
  } catch (error) {
    console.error('Error generating multiple SBERT embeddings:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param a First embedding vector
 * @param b Second embedding vector
 * @returns Similarity score between -1 and 1 (1 being most similar)
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}
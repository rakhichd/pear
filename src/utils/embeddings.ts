import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

// Initialize model - lazy loading pattern
let model: use.UniversalSentenceEncoder | null = null;

/**
 * Loads the Universal Sentence Encoder model if not already loaded
 */
async function getModel(): Promise<use.UniversalSentenceEncoder> {
  if (!model) {
    // Configure TensorFlow.js for optimal performance
    const useWebGL = process.env.NEXT_PUBLIC_TFJS_USE_WEBGL === 'true';
    const useLiteModel = process.env.NEXT_PUBLIC_USE_LITE_MODEL === 'true';
    
    // Set backend based on environment setting
    if (useWebGL && typeof window !== 'undefined') {
      console.log('Using WebGL backend for TensorFlow.js');
      await tf.setBackend('webgl');
    } else {
      console.log('Using CPU backend for TensorFlow.js');
      await tf.setBackend('cpu');
    }
    
    // Load the model. Users of Universal Sentence Encoder often
    // have higher accuracy with the larger model, but the smaller
    // model is faster for deployment.
    if (useLiteModel) {
      console.log('Loading lite Universal Sentence Encoder model');
      model = await use.load({
        modelUrl: 'https://tfhub.dev/tensorflow/tfjs-model/universal-sentence-encoder-lite/1/default/1'
      });
    } else {
      console.log('Loading standard Universal Sentence Encoder model (will pad to 1024 dimensions)');
      model = await use.load();
    }
    
    console.log('Universal Sentence Encoder model loaded successfully');
  }
  return model;
}

/**
 * Generates embeddings for a single text query
 * @param text The text to generate embeddings for
 * @returns A Float32Array of the embedding vector
 */
export async function generateEmbedding(text: string): Promise<Float32Array> {
  try {
    // Ensure model is loaded
    const model = await getModel();
    
    // Generate embeddings
    const embeddings = await model.embed(text);
    
    // Extract the data and convert to Float32Array
    const data = await embeddings.array();
    embeddings.dispose(); // Clean up tensor
    
    // Get the raw embedding vector
    const vector = new Float32Array(data[0]);
    
    // Pad or truncate to match 1024 dimensions for Pinecone
    const paddedVector = new Float32Array(1024);
    
    // Copy values up to the minimum of original length and 1024
    for (let i = 0; i < Math.min(vector.length, 1024); i++) {
      paddedVector[i] = vector[i];
    }
    
    return paddedVector;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

/**
 * Generates embeddings for multiple text queries
 * @param texts An array of texts to generate embeddings for
 * @returns An array of Float32Array embedding vectors
 */
export async function generateEmbeddings(texts: string[]): Promise<Float32Array[]> {
  try {
    // Ensure model is loaded
    const model = await getModel();
    
    // Generate embeddings
    const embeddings = await model.embed(texts);
    
    // Extract the data and convert to array of Float32Arrays
    const data = await embeddings.array();
    embeddings.dispose(); // Clean up tensor
    
    // Process each vector to ensure 1024 dimensions
    return data.map(vector => {
      const paddedVector = new Float32Array(1024);
      
      // Copy values up to the minimum of original length and 1024
      for (let i = 0; i < Math.min(vector.length, 1024); i++) {
        paddedVector[i] = vector[i];
      }
      
      return paddedVector;
    });
  } catch (error) {
    console.error('Error generating embeddings for multiple texts:', error);
    throw error;
  }
}

/**
 * Calculates the cosine similarity between two embedding vectors
 * @param a First embedding vector
 * @param b Second embedding vector
 * @returns A similarity score between -1 and 1 (1 being most similar)
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
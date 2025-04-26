import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

// Cache the model to avoid reloading it for each query
let modelPromise: Promise<use.UniversalSentenceEncoder> | null = null;

/**
 * Loads the Universal Sentence Encoder model
 * We use a singleton pattern to avoid loading the model multiple times
 */
export async function loadModel(): Promise<use.UniversalSentenceEncoder> {
  if (!modelPromise) {
    console.log('Embeddings: Loading USE model for the first time');
    
    // Check if we're running on the server or client
    if (typeof window === 'undefined') {
      // Server-side: we would use Node.js version, but will skip for browser compatibility
      console.log('Embeddings: Running on server-side');
    } else {
      // Client-side: initialize tfjs for browser
      console.log('Embeddings: Running on client-side');
      await tf.ready();
      console.log('Embeddings: TensorFlow.js initialized in browser');
    }
    
    // Load the model
    console.log('Embeddings: Starting model load');
    modelPromise = use.load();
    modelPromise.then(() => {
      console.log('Embeddings: Model loaded successfully');
    }).catch(err => {
      console.error('Embeddings: Error loading model:', err);
      modelPromise = null; // Reset so we can try again
    });
  } else {
    console.log('Embeddings: Using cached model');
  }
  
  return modelPromise;
}

/**
 * Generates an embedding vector for the provided text
 * @param text Text to embed
 * @returns Float32Array of embedding values
 */
export async function generateEmbedding(text: string): Promise<Float32Array> {
  console.log('Embeddings: Generating embedding for text:', text.substring(0, 50) + '...');
  
  if (!text) {
    console.error('Embeddings: No text provided for embedding');
    throw new Error('No text provided for embedding');
  }
  
  try {
    // Load the model
    console.log('Embeddings: Loading model');
    const model = await loadModel();
    console.log('Embeddings: Model loaded, generating embedding');
    
    // Generate embeddings
    const embeddings = await model.embed(text);
    console.log('Embeddings: Raw embedding generated');
    
    const embeddingArray = await embeddings.array();
    console.log('Embeddings: Converted to array');
    
    // Clean up tensor to prevent memory leaks
    embeddings.dispose();
    
    // Process the result - we need to return a Float32Array
    // The model returns a 2D array, but we only need the first (and only) element
    const resultArray = new Float32Array(embeddingArray[0]);
    console.log(`Embeddings: Result array length: ${resultArray.length}`);
    
    // Pad to 1024 dimensions if needed (Pinecone requirement)
    if (resultArray.length < 1024) {
      console.log(`Embeddings: Padding array from ${resultArray.length} to 1024 dimensions`);
      const paddedArray = new Float32Array(1024).fill(0);
      paddedArray.set(resultArray);
      return paddedArray;
    }
    
    console.log('Embeddings: Generated successfully');
    return resultArray;
  } catch (error) {
    console.error('Embeddings: Error generating embedding:', error);
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
    const model = await loadModel();
    
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
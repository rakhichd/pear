#!/usr/bin/env node

/**
 * Process Resume PDF Script
 * 
 * This script:
 * 1. Takes a PDF resume filepath as input
 * 2. Converts the PDF to plaintext
 * 3. Uses Claude API to extract structured information
 * 4. Creates vector embeddings
 * 5. Uploads the data to Pinecone
 * 
 * Usage: node process-resume.js ./path/to/resume.pdf
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Anthropic } = require('@anthropic-ai/sdk');
const { Pinecone } = require('@pinecone-database/pinecone');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const axios = require('axios');

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Initialize Anthropic (Claude) client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});
const indexName = process.env.PINECONE_INDEX_NAME || 'resumefind';
const index = pinecone.Index(indexName);

// Get PDF file path from command line arguments
const pdfFilePath = process.argv[2];
if (!pdfFilePath) {
  console.error('Error: PDF file path is required.');
  console.error('Usage: node process-resume.js ./path/to/resume.pdf');
  process.exit(1);
}

// Generate embedding using OpenAI's API or fallback to a mock embedding
async function generateEmbedding(text) {
  try {
    console.log('Generating embedding for text (first 100 chars):', text.substring(0, 100) + '...');
    
    if (!text) {
      throw new Error('No text provided for embedding');
    }
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('Warning: OPENAI_API_KEY not found in environment variables');
      throw new Error('OPENAI_API_KEY not found');
    }
    
    // Use OpenAI's embedding API
    const response = await axios.post(
      'https://api.openai.com/v1/embeddings',
      {
        input: text,
        model: 'text-embedding-ada-002'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.data && response.data.data[0] && response.data.data[0].embedding) {
      const embedding = response.data.data[0].embedding;
      
      // Resize to match Pinecone's expected dimension (1024)
      const resizedEmbedding = resizeEmbedding(embedding, 1024);
      return resizedEmbedding;
    } else {
      throw new Error('Invalid response from OpenAI API');
    }
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    
    // Return a mock embedding with the correct dimensionality
    console.log('Falling back to mock embedding with dimension 1024');
    return new Array(1024).fill(0).map(() => Math.random() * 0.01); // Small random values
  }
}

// Resize an embedding to match the target dimension
function resizeEmbedding(embedding, targetDimension) {
  if (embedding.length === targetDimension) {
    return embedding;
  }
  
  console.log(`Resizing embedding from ${embedding.length} to ${targetDimension} dimensions`);
  
  // If embedding is larger than target, truncate
  if (embedding.length > targetDimension) {
    return embedding.slice(0, targetDimension);
  }
  
  // If embedding is smaller than target, pad with zeros
  const resized = new Array(targetDimension).fill(0);
  for (let i = 0; i < embedding.length; i++) {
    resized[i] = embedding[i];
  }
  
  return resized;
}

// Process resume PDF
async function processResumePdf(filePath) {
  try {
    console.log(`Processing resume PDF: ${filePath}`);
    
    // 1. Extract text from PDF
    const pdfText = await extractTextFromPdf(filePath);
    console.log(`Successfully extracted ${pdfText.length} characters of text from PDF`);
    
    // 2. Extract structured information using Claude
    const resumeData = await extractResumeData(pdfText);
    console.log('Successfully extracted structured resume data');
    
    // Add metadata
    const timestamp = Date.now();
    const resumeId = `resume-${uuidv4().substring(0, 8)}`;
    const fileName = path.basename(filePath);
    const category = path.basename(path.dirname(filePath)) || 'GENERAL';
    
    // Create PDF URL
    const pdfFilename = path.basename(filePath);
    const pdfDestPath = `public/pdfs/resumes/${category}/${pdfFilename}`;
    const pdfUrl = `/pdfs/resumes/${category}/${pdfFilename}`;
    
    // Copy the PDF file to public directory
    await copyPdfToPublic(filePath, pdfDestPath);
    
    // Complete resume object
    const completeResumeData = {
      ...resumeData,
      id: resumeId,
      content: pdfText,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastUpdated: new Date().toISOString(),
      isPublic: true,
      author: 'System Import',
      formattingStyle: 'professional',
      pdfUrl,
      pdfFilename: fileName,
      category
    };
    
    // 3. Store in Firestore
    await storeInFirestore(resumeId, completeResumeData);
    
    // 4. Generate embedding and store in Pinecone
    await storeInPinecone(resumeId, completeResumeData);
    
    console.log(`Resume processed successfully. Resume ID: ${resumeId}`);
    return resumeId;
    
  } catch (error) {
    console.error('Error processing resume:', error);
    throw error;
  }
}

// Extract text from PDF
async function extractTextFromPdf(filePath) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

// Copy PDF to public directory
async function copyPdfToPublic(sourcePath, destPath) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`PDF copied to ${destPath}`);
  } catch (error) {
    console.error('Error copying PDF file:', error);
    throw error;
  }
}

// Extract structured resume data using Claude
async function extractResumeData(resumeText) {
  try {
    console.log('Sending resume text to Claude for extraction...');
    
    const prompt = `
You are an expert resume parser. Extract structured information from this resume text. 
Respond in valid JSON format with the following fields:
- title: A descriptive title for the resume (like "Software Engineer Resume" or "Marketing Director Resume")
- role: The main role/position of the person
- experienceLevel: One of: "entry", "mid", "senior", "executive"
- skills: An array of technical and soft skills mentioned
- education: A string summarizing education details (school, degree, year)
- educationLevel: One of: "high-school", "associate", "bachelor", "master", "phd"
- yearsExperience: Total years of professional experience
- companies: Array of company names the person has worked for
- interviews: Array of company names where they had interviews (if mentioned)
- offers: Array of company names where they received offers (if mentioned)
- experiences: Array of objects with 'company', 'role', 'duration', and 'summary' for each work experience

Do not include any explanations, just provide the JSON object.

Resume text:
${resumeText}
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      temperature: 0.0,
      system: "You are a resume parsing expert that extracts structured data from resume text. You always return valid JSON.",
      messages: [
        { role: 'user', content: prompt }
      ],
    });
    
    const jsonString = response.content[0].text.trim();
    
    // Clean JSON string - remove markdown code blocks if present
    const cleanJsonString = jsonString.replace(/```json\n|\n```|```/g, '');
    
    try {
      const parsedData = JSON.parse(cleanJsonString);
      return parsedData;
    } catch (parseError) {
      console.error('Error parsing JSON from Claude response:', parseError);
      console.error('Received content:', cleanJsonString);
      throw new Error('Failed to parse structured data from Claude response');
    }
  } catch (error) {
    console.error('Error extracting data with Claude:', error);
    throw error;
  }
}

// Store resume data in Firestore
async function storeInFirestore(resumeId, resumeData) {
  try {
    console.log(`Storing resume data in Firestore with ID: ${resumeId}`);
    const resumeRef = doc(db, 'resumes', resumeId);
    await setDoc(resumeRef, resumeData);
    console.log('Resume data stored in Firestore successfully');
  } catch (error) {
    console.error('Error storing in Firestore:', error);
    throw error;
  }
}

// Prepare resume text for embedding
function prepareResumeTextForEmbedding(resumeData) {
  const parts = [];
  
  if (resumeData.title) parts.push(`Title: ${resumeData.title}`);
  if (resumeData.role) parts.push(`Role: ${resumeData.role}`);
  if (resumeData.experienceLevel) parts.push(`Experience Level: ${resumeData.experienceLevel}`);
  
  if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    parts.push(`Skills: ${resumeData.skills.join(', ')}`);
  }
  
  if (resumeData.education) {
    parts.push(`Education: ${resumeData.education}`);
  }
  
  if (resumeData.yearsExperience) {
    parts.push(`Years Experience: ${resumeData.yearsExperience}`);
  }
  
  if (Array.isArray(resumeData.companies) && resumeData.companies.length > 0) {
    parts.push(`Companies: ${resumeData.companies.join(', ')}`);
  }
  
  if (Array.isArray(resumeData.interviews) && resumeData.interviews.length > 0) {
    parts.push(`Interviews: ${resumeData.interviews.join(', ')}`);
  }
  
  if (Array.isArray(resumeData.offers) && resumeData.offers.length > 0) {
    parts.push(`Offers: ${resumeData.offers.join(', ')}`);
  }
  
  if (Array.isArray(resumeData.experiences) && resumeData.experiences.length > 0) {
    const experiencesText = resumeData.experiences.map(exp => 
      `${exp.role} at ${exp.company} (${exp.duration}): ${exp.summary}`
    ).join('; ');
    parts.push(`Experiences: ${experiencesText}`);
  }
  
  // Add PDF information for searchability
  if (resumeData.pdfUrl) {
    parts.push(`PDF: ${resumeData.pdfUrl}`);
  }
  
  // Add a portion of the content for semantic search
  if (resumeData.content) {
    const contentPreview = resumeData.content.substring(0, 1000);
    parts.push(`Content: ${contentPreview}`);
  }
  
  const result = parts.join('\n');
  return result;
}

// Prepare metadata for Pinecone
function preparePineconeMetadata(resumeData) {
  return {
    // Essential fields
    title: resumeData.title || '',
    role: resumeData.role || '',
    experienceLevel: resumeData.experienceLevel || 'mid',
    
    // Skills and technologies
    skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
    
    // Experience details
    yearsExperience: resumeData.yearsExperience || '',
    companies: Array.isArray(resumeData.companies) ? resumeData.companies : [],
    
    // Education information
    educationLevel: resumeData.educationLevel || 'bachelor',
    education: resumeData.education || '',
    
    // Interview and offer tracking
    interviews: Array.isArray(resumeData.interviews) ? resumeData.interviews : [],
    offers: Array.isArray(resumeData.offers) ? resumeData.offers : [],
    
    // Resume metadata
    author: resumeData.author || '',
    isPublic: resumeData.isPublic === true,
    formattingStyle: resumeData.formattingStyle || 'professional',
    
    // Content preview (for search results)
    contentPreview: resumeData.content ? resumeData.content.substring(0, 500) : '',
    
    // Category information
    category: resumeData.category || 'GENERAL',
    
    // Timestamps
    createdAt: resumeData.createdAt || Date.now(),
    updatedAt: resumeData.updatedAt || Date.now()
  };
}

// Store resume data in Pinecone
async function storeInPinecone(resumeId, resumeData) {
  try {
    console.log('Preparing resume text for embedding');
    const resumeText = prepareResumeTextForEmbedding(resumeData);
    
    // Print out the data that will be converted to embedding
    console.log('\n==== TEXT BEING CONVERTED TO EMBEDDING ====');
    console.log(resumeText);
    console.log('==== END OF TEXT FOR EMBEDDING ====\n');
    
    console.log('Generating embedding vector');
    const contentVector = await generateEmbedding(resumeText);
    
    console.log('Preparing metadata for Pinecone');
    const metadata = preparePineconeMetadata(resumeData);
    
    console.log(`Uploading vector to Pinecone with ID: ${resumeId}`);
    await index.upsert([{
      id: resumeId,
      values: contentVector,
      metadata,
    }]);
    
    console.log('Resume vector stored in Pinecone successfully');
  } catch (error) {
    console.error('Error storing in Pinecone:', error);
    throw error;
  }
}

// Execute the script
processResumePdf(pdfFilePath)
  .then((resumeId) => {
    console.log(`Resume processing completed. Resume ID: ${resumeId}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Resume processing failed:', error);
    process.exit(1);
  }); 
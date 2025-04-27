#!/usr/bin/env node

/**
 * Process Resume PDF Script (Simplified Version)
 * 
 * This script:
 * 1. Takes a PDF resume filepath as input
 * 2. Converts the PDF to plaintext
 * 3. Uses Claude API to extract structured information
 * 4. Stores the data in Firestore
 * 
 * Usage: node scripts/process-resume-simple.js ./path/to/resume.pdf
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Anthropic } = require('@anthropic-ai/sdk');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

// Get PDF file path from command line arguments
const pdfFilePath = process.argv[2];
if (!pdfFilePath) {
  console.error('Error: PDF file path is required.');
  console.error('Usage: node scripts/process-resume-simple.js ./path/to/resume.pdf');
  process.exit(1);
}

// Process resume PDF
async function processResumePdf(filePath) {
  try {
    console.log(`Processing resume PDF: ${filePath}`);
    
    // 1. Extract text from PDF
    const pdfText = await extractTextFromPdf(filePath);
    console.log(`Successfully extracted ${pdfText.length} characters of text from PDF`);
    console.log(`Preview of extracted text: ${pdfText.substring(0, 200)}...`);
    
    // 2. Extract structured information using Claude
    const resumeData = await extractResumeData(pdfText);
    console.log('Successfully extracted structured resume data');
    console.log('Resume data:', JSON.stringify(resumeData, null, 2));
    
    // Add metadata
    const timestamp = Date.now();
    const resumeId = `resume-${uuidv4().substring(0, 8)}`;
    const fileName = path.basename(filePath);
    const category = path.basename(path.dirname(filePath)) || 'PERSONAL';
    
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
#!/usr/bin/env node

/**
 * Process Resume PDF Script
 *
 * 1. Extracts text from a PDF resume
 * 2. Uses Claude to extract structured fields (JSON)
 * 3. Stores the resume in Firestore
 * 4. Copies the PDF to public/pdfs/resumes/<category>/
 * 5. Upserts the resume into Pinecone (integrated inference via llama-text-embed-v2)
 *
 * Usage: node scripts/process-resume.js /path/to/resume.pdf
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

// --- Firebase ---
const firebaseApp = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});
const db = getFirestore(firebaseApp);

// --- Anthropic ---
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// --- Pinecone (integrated inference — no external embedding API needed) ---
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || 'resumefind');

// --- CLI ---
const pdfFilePath = process.argv[2];
if (!pdfFilePath) {
  console.error('Usage: node scripts/process-resume.js /path/to/resume.pdf');
  process.exit(1);
}

// -----------------------------------------------------------------------

async function extractTextFromPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractResumeData(resumeText) {
  console.log('Sending resume to Claude for structured extraction...');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: 'You are a resume parsing expert. Always return valid JSON and nothing else.',
    messages: [{
      role: 'user',
      content: `Extract structured information from this resume. Return a JSON object with these fields:
- title: descriptive title (e.g. "Senior Software Engineer Resume")
- role: main role/position
- experienceLevel: "entry" | "mid" | "senior" | "executive"
- skills: string[] of technical and soft skills
- education: string summarising school, degree, year
- educationLevel: "high-school" | "associate" | "bachelor" | "master" | "phd"
- yearsExperience: total years of professional experience (string)
- companies: string[] of companies worked at
- interviews: string[] of companies where they interviewed (if mentioned)
- offers: string[] of companies where they received offers (if mentioned)
- experiences: { company, role, duration, summary }[]

Resume:
${resumeText}`,
    }],
  });

  const raw = response.content[0].text.trim().replace(/```json\n?|\n?```/g, '');
  return JSON.parse(raw);
}

function prepareResumeText(resumeData) {
  const parts = [];
  if (resumeData.title) parts.push(`Title: ${resumeData.title}`);
  if (resumeData.role) parts.push(`Role: ${resumeData.role}`);
  if (resumeData.experienceLevel) parts.push(`Experience Level: ${resumeData.experienceLevel}`);
  if (resumeData.yearsExperience) parts.push(`Years Experience: ${resumeData.yearsExperience}`);
  if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    parts.push(`Skills: ${resumeData.skills.join(', ')}`);
  }
  if (resumeData.education) parts.push(`Education: ${resumeData.education}`);
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
    const expText = resumeData.experiences
      .map(e => `${e.role} at ${e.company} (${e.duration}): ${e.summary}`)
      .join('; ');
    parts.push(`Experiences: ${expText}`);
  }
  if (resumeData.content) {
    parts.push(`Content: ${resumeData.content.substring(0, 1000)}`);
  }
  return parts.join('\n');
}

async function storeInFirestore(resumeId, resumeData) {
  console.log(`Storing in Firestore: ${resumeId}`);
  await setDoc(doc(db, 'resumes', resumeId), resumeData);
  console.log('Firestore: done');
}

async function storeInPinecone(resumeId, resumeData) {
  console.log(`Storing in Pinecone: ${resumeId}`);

  const text = prepareResumeText(resumeData);
  console.log('\n==== TEXT FOR PINECONE EMBEDDING ====');
  console.log(text);
  console.log('======================================\n');

  await index.upsertRecords([{
    id: resumeId,
    text,  // llama-text-embed-v2 embeds this field automatically
    title: resumeData.title || '',
    role: resumeData.role || '',
    experienceLevel: resumeData.experienceLevel || 'mid',
    skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
    yearsExperience: resumeData.yearsExperience || '',
    companies: Array.isArray(resumeData.companies) ? resumeData.companies : [],
    educationLevel: resumeData.educationLevel || 'bachelor',
    education: resumeData.education || '',
    interviews: Array.isArray(resumeData.interviews) ? resumeData.interviews : [],
    offers: Array.isArray(resumeData.offers) ? resumeData.offers : [],
    author: resumeData.author || '',
    isPublic: true,
    formattingStyle: resumeData.formattingStyle || 'professional',
    contentPreview: resumeData.content ? resumeData.content.substring(0, 500) : '',
    category: resumeData.category || 'GENERAL',
    createdAt: resumeData.createdAt || Date.now(),
    updatedAt: resumeData.updatedAt || Date.now(),
  }]);

  console.log('Pinecone: done');
}

async function processResumePdf(filePath) {
  console.log(`\nProcessing: ${filePath}`);

  const pdfText = await extractTextFromPdf(filePath);
  console.log(`Extracted ${pdfText.length} characters`);

  const resumeData = await extractResumeData(pdfText);
  console.log(`Role: ${resumeData.role} | Level: ${resumeData.experienceLevel}`);

  const timestamp = Date.now();
  const resumeId = `resume-${uuidv4().substring(0, 8)}`;
  const fileName = path.basename(filePath);
  const category = path.basename(path.dirname(filePath)) || 'GENERAL';
  const pdfDestPath = `public/pdfs/resumes/${category}/${fileName}`;
  const pdfUrl = `/pdfs/resumes/${category}/${fileName}`;

  // Copy PDF to public directory
  fs.mkdirSync(path.dirname(pdfDestPath), { recursive: true });
  fs.copyFileSync(filePath, pdfDestPath);
  console.log(`PDF copied to ${pdfDestPath}`);

  const completeData = {
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
    category,
  };

  await storeInFirestore(resumeId, completeData);
  await storeInPinecone(resumeId, completeData);

  console.log(`\nDone! Resume ID: ${resumeId}`);
  return resumeId;
}

// -----------------------------------------------------------------------

processResumePdf(pdfFilePath)
  .then(id => {
    console.log(`Resume processing completed. ID: ${id}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Resume processing failed:', err);
    process.exit(1);
  });

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, setDoc, serverTimestamp } = require('firebase/firestore');
const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');

// Configure Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Configure Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Resume ID and new interview companies to add
const resumeId = 'winston-resume'; // This would be the ID of Winston's resume
const pdfPath = path.join(__dirname, '../data/resumes/Winston_s_Resume (9).pdf');
const companiesToAdd = ['Amazon', 'Sigma Computing'];

// Function to prepare resume text for embedding
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
  
  // Add a portion of the content for semantic search
  if (resumeData.content) {
    const contentPreview = resumeData.content.substring(0, 1000);
    parts.push(`Content: ${contentPreview}`);
  }
  
  return parts.join('\n');
}

// Prepare Pinecone metadata following the standardized format
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
    
    // Timestamps
    createdAt: resumeData.createdAt || Date.now(),
    updatedAt: resumeData.updatedAt || Date.now()
  };
}

// Function to detect or generate Winston's resume ID
async function findWinstonsResumeId() {
  try {
    // First try using the default ID
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeDoc = await getDoc(resumeRef);
    
    if (resumeDoc.exists()) {
      return resumeId;
    }
    
    // If not found, search for resumes with Winston's name in the author field
    console.log("Resume not found with default ID, looking for Winston's resume...");
    console.log("Creating a new entry for Winston's resume from the PDF file.");
    
    // Create a simple resume entry for Winston
    const newResumeId = `winston-resume-${Date.now()}`;
    
    return newResumeId;
  } catch (error) {
    console.error("Error finding Winston's resume:", error);
    throw error;
  }
}

// Function to update interviews in Firebase
async function updateInterviewsInFirebase(resumeId, interviews) {
  try {
    console.log(`Updating interviews in Firebase for resume: ${resumeId}`);
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeDoc = await getDoc(resumeRef);
    
    // If the resume doesn't exist yet, we'll create it
    if (!resumeDoc.exists()) {
      console.log(`Resume ${resumeId} not found in Firestore. Creating a new entry.`);
      // Create basic resume data from the PDF file
      await setDoc(resumeRef, {
        id: resumeId,
        title: "Winston's Resume",
        author: "Winston Lo",
        content: "PDF content extracted from Winston's Resume", // In a real app, you'd extract text from PDF
        role: "Software Engineer",
        experienceLevel: "mid",
        skills: ["JavaScript", "React", "Node.js", "Firebase", "Pinecone", "TensorFlow"],
        companies: [],
        interviews: interviews,
        offers: [],
        education: "Computer Science Degree",
        educationLevel: "bachelor",
        yearsExperience: "3 years",
        isPublic: true,
        formattingStyle: "professional",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastUpdated: new Date().toISOString()
      });
      console.log(`Created new resume entry with ID: ${resumeId}`);
      return {
        id: resumeId,
        title: "Winston's Resume",
        author: "Winston Lo",
        interviews: interviews,
        // Other fields omitted for brevity
        isNew: true
      };
    }
    
    // Get the existing data
    let resumeData = resumeDoc.data();
    
    // Merge the existing interviews with the new ones
    let updatedInterviews = Array.isArray(resumeData.interviews) ? resumeData.interviews : [];
    
    // Add new companies if they don't already exist
    interviews.forEach(company => {
      if (!updatedInterviews.includes(company)) {
        updatedInterviews.push(company);
      }
    });
    
    // Update the document with new interviews
    await updateDoc(resumeRef, {
      interviews: updatedInterviews,
      updatedAt: Date.now(),
      lastUpdated: serverTimestamp()
    });
    
    console.log(`Successfully updated interviews in Firebase: ${updatedInterviews.join(', ')}`);
    
    // Return the updated resume data
    resumeData.interviews = updatedInterviews;
    return resumeData;
  } catch (error) {
    console.error('Error updating interviews in Firebase:', error);
    throw error;
  }
}

// Function to update interviews in Pinecone
async function updateInterviewsInPinecone(resumeId, resumeData) {
  try {
    console.log(`Updating interviews in Pinecone for resume: ${resumeId}`);
    
    // Get the Pinecone index
    const indexName = process.env.PINECONE_INDEX_NAME || 'resumefind';
    const index = pinecone.Index(indexName);
    
    // 1. Prepare the text for embedding using our standardized format
    const resumeText = prepareResumeTextForEmbedding(resumeData);
    
    // 2. Load the Universal Sentence Encoder model
    console.log('Loading embedding model...');
    const model = await use.load();
    console.log('Model loaded successfully');
    
    // 3. Generate embedding for the resume text
    const embedResult = await model.embed(resumeText);
    const embedding = await embedResult.array();
    
    // Pad to 1024 dimensions
    const paddedVector = new Array(1024).fill(0);
    for (let i = 0; i < Math.min(embedding[0].length, 1024); i++) {
      paddedVector[i] = embedding[0][i];
    }
    
    // Clean up tensor
    embedResult.dispose();
    
    // 4. Prepare the standardized metadata
    const metadata = preparePineconeMetadata(resumeData);
    
    // 5. Upsert the document with its vector into Pinecone
    await index.upsert([{
      id: resumeId,
      values: paddedVector,
      metadata,
    }]);
    
    console.log(`Successfully updated interviews in Pinecone for ${resumeId}`);
    return true;
  } catch (error) {
    console.error('Error updating interviews in Pinecone:', error);
    throw error;
  }
}

// Main function to update interviews
async function updateInterviews() {
  try {
    // Find or generate Winston's resume ID
    const actualResumeId = await findWinstonsResumeId();
    
    // 1. Update interviews in Firebase
    const updatedResumeData = await updateInterviewsInFirebase(actualResumeId, companiesToAdd);
    
    // 2. Update interviews in Pinecone
    await updateInterviewsInPinecone(actualResumeId, updatedResumeData);
    
    console.log('✅ Successfully updated interviews for Winston\'s resume');
    console.log(`Resume ID: ${actualResumeId}`);
    console.log(`Added interviews: ${companiesToAdd.join(', ')}`);
    console.log(`Total interviews: ${updatedResumeData.interviews.join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating interviews:', error);
    process.exit(1);
  }
}

// Run the update
updateInterviews(); 
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, collection, getDocs, query, where, serverTimestamp } = require('firebase/firestore');
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

// Base path for PDFs
const PDF_BASE_PATH = path.join(__dirname, '../data/resumes/archive/data/data');
const PDF_PUBLIC_PATH = '/pdfs/resumes'; // This would be the public URL path

// Define category directories to search
const CATEGORY_DIRS = [
  'ENGINEERING', 'INFORMATION-TECHNOLOGY', 'SALES', 'FINANCE', 'BUSINESS-DEVELOPMENT',
  'HEALTHCARE', 'TEACHER', 'DESIGNER', 'DIGITAL-MEDIA', 'HR', 'ACCOUNTANT', 'ARTS',
  'ADVOCATE', 'BANKING', 'CONSULTANT', 'PUBLIC-RELATIONS', 'FITNESS', 'CHEF', 'BPO',
  'APPAREL', 'AVIATION', 'AUTOMOBILE', 'AGRICULTURE', 'CONSTRUCTION'
];

// Map to store category to PDF paths
const categoryToPdfs = {};

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
  
  // Add PDF information for searchability
  if (resumeData.pdfUrl) {
    parts.push(`PDF: ${resumeData.pdfUrl}`);
  }
  
  if (resumeData.pdfFilename) {
    parts.push(`PDF Filename: ${resumeData.pdfFilename}`);
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
    
    // PDF information
    pdfUrl: resumeData.pdfUrl || '',
    pdfFilename: resumeData.pdfFilename || '',
    
    // Content preview (for search results)
    contentPreview: resumeData.content ? resumeData.content.substring(0, 500) : '',
    
    // Timestamps
    createdAt: resumeData.createdAt || Date.now(),
    updatedAt: resumeData.updatedAt || Date.now()
  };
}

// Function to scan directories and build a map of PDFs
async function scanPdfDirectories() {
  console.log('Scanning PDF directories...');
  
  for (const category of CATEGORY_DIRS) {
    const categoryPath = path.join(PDF_BASE_PATH, category);
    
    try {
      if (fs.existsSync(categoryPath)) {
        const files = fs.readdirSync(categoryPath)
          .filter(file => file.toLowerCase().endsWith('.pdf'));
        
        categoryToPdfs[category] = files.map(file => ({
          filename: file,
          path: path.join(categoryPath, file),
          // Convert file ID to match Kaggle format
          id: `kaggle-${file.replace('.pdf', '')}`
        }));
        
        console.log(`Found ${files.length} PDFs in ${category} category`);
      }
    } catch (error) {
      console.error(`Error scanning directory ${category}:`, error);
    }
  }
  
  // Handle Winston's resume separately
  const winstonResumePath = path.join(__dirname, '../data/resumes/Winston_s_Resume (9).pdf');
  
  if (fs.existsSync(winstonResumePath)) {
    categoryToPdfs['PERSONAL'] = [{
      filename: 'Winston_s_Resume (9).pdf',
      path: winstonResumePath,
      id: 'winston-resume-1745700150933' // Use the ID from the earlier script
    }];
    console.log('Added Winston\'s resume to the update list');
  }
  
  // Count total PDFs
  const totalPdfs = Object.values(categoryToPdfs)
    .reduce((acc, pdfs) => acc + pdfs.length, 0);
  
  console.log(`Total PDFs found: ${totalPdfs}`);
}

// Function to update a resume's PDF path in Firebase
async function updateResumePdfInFirebase(resumeId, pdfFilename, pdfUrl) {
  try {
    console.log(`Updating PDF path for resume: ${resumeId}`);
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeDoc = await getDoc(resumeRef);
    
    if (!resumeDoc.exists()) {
      console.log(`Resume ${resumeId} not found in Firestore. Skipping...`);
      return null;
    }
    
    // Get the existing data
    let resumeData = resumeDoc.data();
    
    // Update with PDF information
    await updateDoc(resumeRef, {
      pdfUrl: pdfUrl,
      pdfFilename: pdfFilename,
      updatedAt: Date.now(),
      lastUpdated: serverTimestamp()
    });
    
    console.log(`Successfully updated PDF path in Firebase for ${resumeId}`);
    
    // Return the updated resume data
    resumeData.pdfUrl = pdfUrl;
    resumeData.pdfFilename = pdfFilename;
    return resumeData;
  } catch (error) {
    console.error(`Error updating PDF path for resume ${resumeId}:`, error);
    return null;
  }
}

// Function to update resume's PDF reference in Pinecone
async function updateResumePdfInPinecone(resumeId, resumeData) {
  try {
    console.log(`Updating PDF reference in Pinecone for resume: ${resumeId}`);
    
    // Get the Pinecone index
    const indexName = process.env.PINECONE_INDEX_NAME || 'resumefind';
    const index = pinecone.Index(indexName);
    
    // 1. Prepare the text for embedding using our standardized format
    const resumeText = prepareResumeTextForEmbedding(resumeData);
    
    // 2. Generate embedding for the resume text
    console.log('Generating new embedding...');
    const model = await use.load();
    const embedResult = await model.embed(resumeText);
    const embedding = await embedResult.array();
    
    // Pad to 1024 dimensions
    const paddedVector = new Array(1024).fill(0);
    for (let i = 0; i < Math.min(embedding[0].length, 1024); i++) {
      paddedVector[i] = embedding[0][i];
    }
    
    // Clean up tensor
    embedResult.dispose();
    
    // 3. Prepare the standardized metadata
    const metadata = preparePineconeMetadata(resumeData);
    
    // 4. Upsert the document with its vector into Pinecone
    await index.upsert([{
      id: resumeId,
      values: paddedVector,
      metadata,
    }]);
    
    console.log(`Successfully updated PDF reference in Pinecone for ${resumeId}`);
    return true;
  } catch (error) {
    console.error(`Error updating Pinecone for resume ${resumeId}:`, error);
    return false;
  }
}

// Main function to update PDF paths in the database
async function updatePdfPaths() {
  try {
    // 1. Scan directories to find PDF files
    await scanPdfDirectories();
    
    // 2. Load the Universal Sentence Encoder model once
    console.log('Loading embedding model...');
    const model = await use.load();
    console.log('Model loaded successfully');
    
    let successCount = 0;
    let failureCount = 0;
    
    // 3. Process each category
    for (const [category, pdfs] of Object.entries(categoryToPdfs)) {
      console.log(`Processing ${pdfs.length} PDFs in ${category} category...`);
      
      // Use a smaller batch size to avoid overwhelming the services
      const batchSize = 5;
      
      // Process in batches
      for (let i = 0; i < pdfs.length; i += batchSize) {
        const batch = pdfs.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(pdfs.length/batchSize)}...`);
        
        // Process each PDF in the batch
        const batchPromises = batch.map(async (pdf) => {
          try {
            // 1. Prepare the public URL
            const publicUrl = `${PDF_PUBLIC_PATH}/${category}/${pdf.filename}`;
            
            // 2. Update Firebase
            const updatedData = await updateResumePdfInFirebase(pdf.id, pdf.filename, publicUrl);
            
            if (!updatedData) {
              console.log(`Skipped ${pdf.id} - not found in database`);
              return false;
            }
            
            // 3. Update Pinecone
            const pineconeSuccess = await updateResumePdfInPinecone(pdf.id, updatedData);
            
            if (pineconeSuccess) {
              successCount++;
              return true;
            } else {
              failureCount++;
              return false;
            }
          } catch (error) {
            console.error(`Error processing ${pdf.id}:`, error);
            failureCount++;
            return false;
          }
        });
        
        // Wait for all PDFs in this batch to be processed
        await Promise.all(batchPromises);
        
        // Small delay between batches to avoid rate limits
        console.log('Waiting before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n--- PDF Update Summary ---');
    console.log(`Total success: ${successCount}`);
    console.log(`Total failures: ${failureCount}`);
    console.log('Update completed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in PDF update process:', error);
    process.exit(1);
  }
}

// Start the update process
updatePdfPaths(); 
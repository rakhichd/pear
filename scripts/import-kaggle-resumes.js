require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Pinecone } = require('@pinecone-database/pinecone');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
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

const resumesPath = path.join(__dirname, '../data/resumes/Resume.csv');
const processedDataPath = path.join(__dirname, '../data/resumes/processed_data.json');

// Helper function to extract skills from resume text
function extractSkills(text) {
  // Basic skill extraction based on common tech skills
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Swift',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'MongoDB',
    'Machine Learning', 'AI', 'Deep Learning', 'Data Science', 'TensorFlow', 'PyTorch',
    'HTML', 'CSS', 'Sass', 'Redux', 'REST API', 'GraphQL', 'Git', 'CI/CD',
    'Agile', 'Scrum', 'DevOps', 'Testing', 'Security', 'Blockchain', 'Cloud',
    'Product Management', 'UI/UX', 'Figma', 'Adobe'
  ];
  
  // Create a case-insensitive regex for each skill
  const skills = [];
  for (const skill of skillKeywords) {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(text)) {
      skills.push(skill);
    }
  }
  
  return skills;
}

// Helper function to extract experience level
function extractExperienceLevel(text) {
  if (/senior|lead|principal|architect|manager|director|head/i.test(text)) {
    return 'senior';
  } else if (/mid|intermediate|\b[3-6] years\b/i.test(text)) {
    return 'mid';
  } else if (/junior|entry|intern|graduate|fresher|\b[0-2] years\b/i.test(text)) {
    return 'entry';
  } else if (/cxo|chief|executive|vp|vice president/i.test(text)) {
    return 'executive';
  }
  return 'mid'; // Default to mid-level
}

// Helper function to extract education level
function extractEducationLevel(text) {
  if (/ph[.]?d|doctorate/i.test(text)) {
    return 'phd';
  } else if (/master|mba|m[.]s[.]|m[.]eng/i.test(text)) {
    return 'master';
  } else if (/bachelor|b[.]s[.]|b[.]a[.]|b[.]eng/i.test(text)) {
    return 'bachelor';
  } else if (/associate|a[.]a[.]|a[.]s[.]/i.test(text)) {
    return 'associate';
  }
  return 'bachelor'; // Default to bachelor
}

// Helper function to extract companies
function extractCompanies(text) {
  // Common tech companies to look for
  const commonCompanies = [
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Facebook', 'Meta', 'Netflix', 'IBM',
    'Oracle', 'Salesforce', 'Adobe', 'Intel', 'Cisco', 'Twitter', 'LinkedIn', 'Uber',
    'Airbnb', 'Stripe', 'Square', 'PayPal', 'eBay', 'Shopify', 'Spotify', 'Tesla'
  ];
  
  const companies = [];
  for (const company of commonCompanies) {
    const regex = new RegExp(`\\b${company}\\b`, 'i');
    if (regex.test(text)) {
      companies.push(company);
    }
  }
  
  return companies;
}

// Extract years of experience
function extractYearsExperience(text) {
  const match = text.match(/\b(\d+)(?:\s*[-+]?\s*\d*)?\s*(?:years|yrs|yr)(?:\s+of\s+experience)?\b/i);
  if (match) {
    return match[1] + ' years';
  }
  return ''; // Default to empty string if no explicit years found
}

// Simple schema for standardized resume data
const standardizeResume = (csvRow, index) => {
  const resumeId = `kaggle-${csvRow.ID || index}`;
  const content = csvRow.Resume_str || '';
  const category = csvRow.Category || 'General';
  
  // Extract more information
  const skills = extractSkills(content);
  const experienceLevel = extractExperienceLevel(content);
  const educationLevel = extractEducationLevel(content);
  const companies = extractCompanies(content);
  const yearsExperience = extractYearsExperience(content);
  
  // Basic standardized schema
  return {
    id: resumeId,
    title: `${category} Resume`,
    role: category,
    content: content,
    category: category,
    
    // Skills and technologies
    skills: skills,
    
    // Experience details
    experienceLevel: experienceLevel,
    yearsExperience: yearsExperience,
    companies: companies,
    
    // Education information
    education: educationLevel !== 'bachelor' ? `${educationLevel} degree` : 'Bachelor\'s degree',
    educationLevel: educationLevel,
    
    // Default values for required fields
    author: 'Kaggle User',
    isPublic: true,
    interviews: [],
    offers: [],
    formattingStyle: 'professional',
    
    // Source and timestamps
    source: 'Kaggle Dataset',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastUpdated: new Date().toISOString(),
  };
};

// Process the CSV file
const processCSV = () => {
  return new Promise((resolve, reject) => {
    console.log('Reading resume data from CSV...');
    
    if (!fs.existsSync(resumesPath)) {
      return reject(new Error(`File not found: ${resumesPath}`));
    }
    
    const processedResumes = [];
    
    fs.createReadStream(resumesPath)
      .pipe(csv())
      .on('data', (data, index) => {
        // Standardize the resume data
        const resumeData = standardizeResume(data, processedResumes.length);
        processedResumes.push(resumeData);
        
        // Log progress
        if (processedResumes.length % 100 === 0) {
          console.log(`Processed ${processedResumes.length} resumes...`);
        }
      })
      .on('end', () => {
        console.log(`Completed processing ${processedResumes.length} resumes`);
        // Save to file for reference
        fs.writeFileSync(processedDataPath, JSON.stringify(processedResumes, null, 2));
        resolve(processedResumes);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

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
  
  // Add content at the end for semantic matching
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

// Upload to both Firebase and Pinecone
const uploadData = async (resumes) => {
  try {
    // 1. Load Universal Sentence Encoder model
    console.log('Loading embedding model...');
    const model = await use.load();
    console.log('Model loaded successfully');
    
    const batchSize = 20;
    const indexName = process.env.PINECONE_INDEX_NAME || 'resumefind';
    const index = pinecone.Index(indexName);
    
    // Process in batches
    for (let i = 0; i < resumes.length; i += batchSize) {
      const batch = resumes.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(resumes.length/batchSize)}...`);
      
      // Generate embeddings for the batch using standardized format
      const texts = batch.map(resume => prepareResumeTextForEmbedding(resume));
      const embedResults = await model.embed(texts);
      const embeddings = await embedResults.array();
      
      // Prepare promises for Firebase and vectors for Pinecone
      const firebasePromises = [];
      const pineconeVectors = [];
      
      batch.forEach((resume, j) => {
        // Firebase document
        const resumeRef = doc(db, 'resumes', resume.id);
        firebasePromises.push(
          setDoc(resumeRef, {
            ...resume,
            lastUpdated: serverTimestamp()
          })
        );
        
        // Pinecone vector - pad to 1024 dimensions
        const vector = embeddings[j];
        const paddedVector = new Array(1024).fill(0);
        for (let k = 0; k < Math.min(vector.length, 1024); k++) {
          paddedVector[k] = vector[k];
        }
        
        // Prepare standardized metadata
        const metadata = preparePineconeMetadata(resume);
        
        pineconeVectors.push({
          id: resume.id,
          values: paddedVector,
          metadata
        });
      });
      
      // Execute uploads
      try {
        console.log(`Uploading batch ${Math.floor(i/batchSize) + 1} to Firebase...`);
        await Promise.all(firebasePromises);
        console.log(`Firebase upload for batch ${Math.floor(i/batchSize) + 1} completed successfully`);
      } catch (firebaseError) {
        console.error(`Error uploading to Firebase: ${firebaseError.message}`);
        console.log('Continuing with Pinecone upload...');
      }
      
      console.log(`Uploading batch ${Math.floor(i/batchSize) + 1} to Pinecone...`);
      await index.upsert(pineconeVectors);
      
      console.log(`Completed batch ${Math.floor(i/batchSize) + 1}`);
      
      // Clean up tensor
      embedResults.dispose();
    }
    
    console.log('All data uploaded successfully');
    return true;
  } catch (error) {
    console.error('Error uploading data:', error);
    throw error;
  }
};

// Main function
const importResumes = async () => {
  try {
    // Process the CSV file
    const resumes = await processCSV();
    
    // Upload to Firebase and Pinecone
    await uploadData(resumes);
    
    console.log('Import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error importing resumes:', error);
    process.exit(1);
  }
};

// Run the import
importResumes(); 
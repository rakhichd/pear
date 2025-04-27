#!/usr/bin/env node

/**
 * Process All Resumes in a Folder
 * 
 * This script processes all PDF files in a specified directory using the process-resume.js script.
 * 
 * Usage: node scripts/process-folder.js ./path/to/resume/folder
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get folder path from command line arguments
const folderPath = process.argv[2];
if (!folderPath) {
  console.error('Error: Folder path is required.');
  console.error('Usage: node process-folder.js ./path/to/resume/folder');
  process.exit(1);
}

// Process all PDFs in a folder
async function processFolder(dirPath) {
  try {
    console.log(`Processing all PDFs in directory: ${dirPath}`);
    
    // Check if directory exists
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      console.error(`Error: Directory ${dirPath} does not exist or is not a directory`);
      process.exit(1);
    }
    
    // Find all PDF files
    const files = fs.readdirSync(dirPath)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(dirPath, file));
    
    console.log(`Found ${files.length} PDF files to process`);
    
    // Process each file
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n[${i+1}/${files.length}] Processing ${path.basename(file)}...`);
      
      try {
        // Call the process-resume.js script for this file
        execSync(`node scripts/process-resume.js "${file}"`, { stdio: 'inherit' });
        successCount++;
        console.log(`Successfully processed ${path.basename(file)}`);
      } catch (error) {
        failureCount++;
        console.error(`Failed to process ${path.basename(file)}: ${error.message}`);
        // Continue with the next file even if this one failed
      }
    }
    
    console.log(`\nProcessing completed.`);
    console.log(`Successfully processed: ${successCount} files`);
    console.log(`Failed to process: ${failureCount} files`);
  } catch (error) {
    console.error('Error processing folder:', error);
    process.exit(1);
  }
}

// Execute the script
processFolder(folderPath); 
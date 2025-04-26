import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,  // Disable default body parser to handle raw file uploads
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract file and metadata from the request
    const file = formData.get('file') as File;
    const role = formData.get('role') as string;
    const result = formData.get('result') as string;
    
    if (!file || !role || !result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the resume
    const resumeId = crypto.randomUUID();
    
    // Get file buffer from the File object
    const fileBuffer = await file.arrayBuffer();

    // Define the local path where the file will be saved
    const dataDir = path.join(process.cwd(), 'data', 'resumes');
    const resumeDir = path.join(dataDir, resumeId);
    
    // Create directories if they don't exist
    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.mkdir(resumeDir, { recursive: true });
    } catch (dirError) {
      console.error('Error creating directories:', dirError);
      throw new Error('Failed to create directories for resume storage');
    }
    
    // Save the file to the local filesystem
    const filePath = path.join(resumeDir, file.name);
    await fs.writeFile(filePath, Buffer.from(fileBuffer));
    
    // Store metadata in a JSON file
    const resumeData = {
      id: resumeId,
      fileName: file.name,
      filePath: filePath.replace(process.cwd(), ''),
      role,
      result,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save the metadata to a JSON file
    const metadataPath = path.join(resumeDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(resumeData, null, 2));
    
    // Also save to a central processed_data.json file that contains all resumes
    const processedDataPath = path.join(dataDir, 'processed_data.json');
    
    // Try to read existing data or start with an empty array
    let allResumes = [];
    try {
      const existingData = await fs.readFile(processedDataPath, 'utf-8');
      allResumes = JSON.parse(existingData);
    } catch (err) {
      // File doesn't exist or can't be parsed, starting with empty array
    }
    
    // Add the new resume to the array
    allResumes.push(resumeData);
    
    // Write back the updated data
    await fs.writeFile(processedDataPath, JSON.stringify(allResumes, null, 2));

    // Skip the indexing step for now to focus on just saving the file
    console.log('Resume saved successfully, skipping indexing step');

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeId
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}

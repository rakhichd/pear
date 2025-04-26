import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resumeId = params.id;
    
    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Fetching resume with ID: ${resumeId}`);
    
    // Fetch the resume from local filesystem
    const dataDir = path.join(process.cwd(), 'data', 'resumes');
    const metadataPath = path.join(dataDir, resumeId, 'metadata.json');
    
    let resumeData;
    try {
      const fileContent = await fs.readFile(metadataPath, 'utf-8');
      resumeData = JSON.parse(fileContent);
    } catch (err) {
      console.error('Error reading resume file:', err);
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    // Format the resume data (ensure lastUpdated is present)
    if (!resumeData.lastUpdated) {
      resumeData.lastUpdated = resumeData.updatedAt || new Date().toISOString();
    }
    
    return NextResponse.json({ resume: resumeData });
  } catch (error: any) {
    console.error('Error fetching resume:', error);
    
    return NextResponse.json(
      { error: `Failed to fetch resume: ${error.message}` },
      { status: 500 }
    );
  }
} 
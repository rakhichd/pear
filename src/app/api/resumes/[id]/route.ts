import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // Fetch the resume from local filesystem
    const dataDir = path.join(process.cwd(), 'data', 'resumes');
    const metadataPath = path.join(dataDir, id, 'metadata.json');
    
    let resumeData;
    try {
      const fileContent = await fs.readFile(metadataPath, 'utf-8');
      resumeData = JSON.parse(fileContent);
    } catch (err) {
      console.error('Error reading resume file:', err);
      
      // If file doesn't exist, fall back to the mock data for demo purposes
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    // Simulate a premium content check (if needed)
    const isPremiumUser = false; // In a real app, this would be determined by authentication
    
    if (!isPremiumUser && resumeData.isPublic === false) {
      return NextResponse.json(
        { error: 'This resume requires a premium subscription' },
        { status: 403 }
      );
    }

    return NextResponse.json(resumeData);
  } catch (error) {
    console.error('Resume fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { indexResume } from '@/lib/pinecone';
import { promises as fs } from 'fs';
import path from 'path';
import { prepareResumeTextForEmbedding, truncateText } from '@/utils/textProcessing';

// API route for indexing a resume in the vector database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // 1. Fetch the resume data from local file system
    const dataDir = path.join(process.cwd(), 'data', 'resumes');
    const metadataPath = path.join(dataDir, resumeId, 'metadata.json');
    
    let resumeData;
    try {
      const fileContent = await fs.readFile(metadataPath, 'utf-8');
      resumeData = JSON.parse(fileContent);
    } catch (err) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // 2. Process resume data to prepare for embedding
    let resumeText = prepareResumeTextForEmbedding(resumeData);
    
    // 3. Truncate if necessary (embedding models often have token limits)
    resumeText = truncateText(resumeText);

    // 4. Index the resume in Pinecone with embeddings
    await indexResume(resumeId, resumeData, resumeText);

    return NextResponse.json({
      success: true,
      message: 'Resume indexed successfully',
      resumeId
    });
  } catch (error) {
    console.error('Error indexing resume:', error);
    return NextResponse.json(
      { error: 'Failed to index resume' },
      { status: 500 }
    );
  }
}

// API route for deleting a resume from the vector database
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get('id');

  if (!resumeId) {
    return NextResponse.json(
      { error: 'Resume ID is required' },
      { status: 400 }
    );
  }

  try {
    // Delete the resume from Pinecone using the correct absolute URL
    const { origin } = new URL(request.url);
    const result = await fetch(`${origin}/api/resumes/${resumeId}/index`, {
      method: 'DELETE',
    });

    if (!result.ok) {
      throw new Error('Failed to delete resume from index');
    }

    // Remove the resume from the processed_data.json file
    const dataDir = path.join(process.cwd(), 'data', 'resumes');
    const processedDataPath = path.join(dataDir, 'processed_data.json');
    
    try {
      const fileContent = await fs.readFile(processedDataPath, 'utf-8');
      let allResumes = JSON.parse(fileContent);
      
      // Filter out the deleted resume
      allResumes = allResumes.filter((resume: any) => resume.id !== resumeId);
      
      // Write back the updated data
      await fs.writeFile(processedDataPath, JSON.stringify(allResumes, null, 2));
      
      // Optionally, delete the resume directory
      const resumeDir = path.join(dataDir, resumeId);
      await fs.rm(resumeDir, { recursive: true, force: true });
    } catch (err) {
      console.error('Error updating processed_data.json:', err);
      // Continue even if we couldn't update the file
    }

    return NextResponse.json({
      success: true,
      message: 'Resume removed from index and local storage',
      resumeId
    });
  } catch (error) {
    console.error('Error deleting resume from index:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume from index' },
      { status: 500 }
    );
  }
} 
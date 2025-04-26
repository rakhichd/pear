import { NextRequest, NextResponse } from 'next/server';
import { indexResume } from '@/lib/pinecone';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
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

    // 1. Fetch the resume data from Firestore
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);

    if (!resumeSnap.exists()) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    const resumeData = resumeSnap.data();

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
    // Delete the resume from Pinecone
    const result = await fetch(`/api/resumes/${resumeId}/index`, {
      method: 'DELETE',
    });

    if (!result.ok) {
      throw new Error('Failed to delete resume from index');
    }

    return NextResponse.json({
      success: true,
      message: 'Resume removed from index',
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
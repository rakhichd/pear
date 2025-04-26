import { NextRequest, NextResponse } from 'next/server';
import { indexResume, deleteResumeFromIndex } from '@/lib/pinecone';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { prepareResumeTextForEmbedding, truncateText } from '@/utils/textProcessing';

// API route for indexing or deleting a specific resume
export async function PUT(
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

export async function DELETE(
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

    // Delete the resume from Pinecone
    await deleteResumeFromIndex(resumeId);

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
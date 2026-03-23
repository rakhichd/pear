import { NextRequest, NextResponse } from 'next/server';
import { indexResume, deleteResumeFromIndex } from '@/lib/pinecone';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ResumeData } from '@/types';

// API route for indexing or deleting a specific resume
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resumeId } = await params;

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

    const resumeData = resumeSnap.data() as ResumeData;

    await indexResume(resumeId, resumeData);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resumeId } = await params;

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
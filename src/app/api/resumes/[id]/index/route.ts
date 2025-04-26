import { NextRequest, NextResponse } from 'next/server';
import { deleteResumeFromIndex } from '@/lib/pinecone';

// API route for deleting a specific resume

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
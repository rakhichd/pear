import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
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

    // Fetch the resume from Firestore
    const resumeRef = doc(db, 'resumes', resumeId);
    let resumeSnap;

    try {
      resumeSnap = await getDoc(resumeRef);
    } catch (fetchError: unknown) {
      const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error(`Error getting document from Firestore: ${msg}`);
      throw new Error(`Database fetch error: ${msg}`);
    }
    
    if (!resumeSnap.exists()) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    const resumeData = resumeSnap.data();

    // Format the resume data
    const formattedResumeData = {
      id: resumeSnap.id,
      ...resumeData,
      // Convert Firestore timestamp to ISO string if it exists
      lastUpdated: resumeData.lastUpdated ? 
        (typeof resumeData.lastUpdated.toDate === 'function' ? 
          resumeData.lastUpdated.toDate().toISOString() : 
          resumeData.lastUpdated) : 
        new Date().toISOString()
    };
    
    return NextResponse.json({ resume: formattedResumeData });
  } catch (error: unknown) {
    console.error('Error fetching resume:', error);
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('Stack trace:', stack);
    
    return NextResponse.json(
      { error: `Failed to fetch resume: ${message}` },
      { status: 500 }
    );
  }
} 
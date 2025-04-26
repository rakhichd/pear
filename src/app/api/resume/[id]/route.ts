import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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
    
    // Fetch the resume from Firestore
    const resumeRef = doc(db, 'resumes', resumeId);
    const resumeSnap = await getDoc(resumeRef);
    
    if (!resumeSnap.exists()) {
      // If resume doesn't exist in Firestore, check Pinecone metadata
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    // Format the resume data
    const resumeData = {
      id: resumeSnap.id,
      ...resumeSnap.data(),
      // Convert Firestore timestamp to ISO string if it exists
      lastUpdated: resumeSnap.data().lastUpdated ? 
        resumeSnap.data().lastUpdated.toDate().toISOString() : 
        new Date().toISOString()
    };
    
    return NextResponse.json({ resume: resumeData });
  } catch (error: any) {
    console.error('Error fetching resume:', error);
    
    return NextResponse.json(
      { error: `Failed to fetch resume: ${error.message}` },
      { status: 500 }
    );
  }
} 
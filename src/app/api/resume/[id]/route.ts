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
      console.log('Resume ID is missing in request');
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Fetching resume with ID: ${resumeId}`);
    
    // Fetch the resume from Firestore
    const resumeRef = doc(db, 'resumes', resumeId);
    let resumeSnap;

    try {
      resumeSnap = await getDoc(resumeRef);
    } catch (fetchError) {
      console.error(`Error getting document from Firestore: ${fetchError.message}`);
      throw new Error(`Database fetch error: ${fetchError.message}`);
    }
    
    if (!resumeSnap.exists()) {
      console.log(`Resume not found: ${resumeId}`);
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    
    const resumeData = resumeSnap.data();
    console.log(`Resume found. Title: ${resumeData.title}`);
    
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
  } catch (error: any) {
    console.error('Error fetching resume:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { error: `Failed to fetch resume: ${error.message}` },
      { status: 500 }
    );
  }
} 
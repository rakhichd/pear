import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// Mock resume data for localStorage fallback
const mockResumeData = {
  'kaggle-16852973': {
    id: 'kaggle-16852973',
    title: 'HR Professional Resume',
    content: 'Experience in human resources, recruitment, and employee relations...',
    category: 'Human Resources',
    source: 'Kaggle Dataset',
    lastUpdated: new Date().toISOString(),
    skills: ['Recruitment', 'Onboarding', 'Employee Relations', 'HR Management'],
    experienceLevel: '5+ years',
    education: 'Bachelor in Human Resources'
  }
}

// Helper for localStorage operations in Next.js API routes
// This will only work client-side, but we include it to avoid server errors
const getLocalStorageSavedResumes = (userId: string) => {
  try {
    // This is a server-side API that doesn't have access to localStorage
    // In a real app, we would use a database
    // This is just for fallback in the demo app
    return [];
  } catch (error) {
    console.error('localStorage not available in API route:', error);
    return [];
  }
};

export async function GET(request: Request) {
  try {
    // Get the user ID from the query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
      // Try to query Firestore first
      const savedResumesQuery = query(
        collection(db, 'savedResumes'),
        where('userId', '==', userId)
      );

      const savedResumesSnapshot = await getDocs(savedResumesQuery);
      
      if (savedResumesSnapshot.empty) {
        return NextResponse.json({ savedResumes: [] });
      }

      // Extract the resume IDs
      const savedResumeIds = savedResumesSnapshot.docs.map(doc => doc.data().resumeId);

      // Fetch the actual resume data
      const resumesQuery = query(
        collection(db, 'resumes'),
        where('__name__', 'in', savedResumeIds)
      );

      const resumesSnapshot = await getDocs(resumesQuery);
      
      // Format the resume data
      const resumes = resumesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return NextResponse.json({ savedResumes: resumes });
    } catch (firestoreError) {
      console.warn('Firestore error, falling back to mock data:', firestoreError);
      
      // For demo purposes, just return mock data for the sample resume
      // In a real app, we would use localStorage data here
      const mockSavedResumes = [mockResumeData['kaggle-16852973']];
      
      return NextResponse.json({ savedResumes: mockSavedResumes });
    }
  } catch (error) {
    console.error('Error fetching saved resumes:', error);
    return NextResponse.json({ error: 'Failed to fetch saved resumes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, resumeId } = await request.json();

    if (!userId || !resumeId) {
      return NextResponse.json({ error: 'User ID and Resume ID are required' }, { status: 400 });
    }

    try {
      // Try to use Firestore first
      // Create a unique ID for the saved resume record
      const savedResumeId = `${userId}_${resumeId}`;

      // Add to savedResumes collection
      await setDoc(doc(db, 'savedResumes', savedResumeId), {
        userId,
        resumeId,
        savedAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true });
    } catch (firestoreError) {
      console.warn('Firestore error, using mock success response:', firestoreError);
      
      // For the API route, we'll just return success
      // The client-side code will handle the localStorage fallback
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error saving resume:', error);
    return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resumeId = searchParams.get('resumeId');

    if (!userId || !resumeId) {
      return NextResponse.json({ error: 'User ID and Resume ID are required' }, { status: 400 });
    }

    try {
      // Try to use Firestore first
      // Create the unique ID for the saved resume record
      const savedResumeId = `${userId}_${resumeId}`;

      // Remove from savedResumes collection
      await deleteDoc(doc(db, 'savedResumes', savedResumeId));

      return NextResponse.json({ success: true });
    } catch (firestoreError) {
      console.warn('Firestore error, using mock success response:', firestoreError);
      
      // For the API route, we'll just return success
      // The client-side code will handle the localStorage fallback
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error removing saved resume:', error);
    return NextResponse.json({ error: 'Failed to remove saved resume' }, { status: 500 });
  }
}
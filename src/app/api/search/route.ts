import { NextRequest, NextResponse } from 'next/server';
import { searchResumes } from '@/lib/pinecone';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchQuery, filters, page = 1, pageSize = 10 } = body;

    if (!searchQuery && (!filters || Object.keys(filters).length === 0)) {
      return NextResponse.json(
        { error: 'Search query or filters are required' },
        { status: 400 }
      );
    }

    // 1. Search Pinecone for semantic matches using embeddings
    const searchResults = await searchResumes(searchQuery, filters, pageSize);
    
    if (!searchResults.matches || searchResults.matches.length === 0) {
      return NextResponse.json({
        results: [],
        page,
        totalPages: 0,
        totalResults: 0,
      });
    }

    // 2. Get actual resume data from Firestore using the matched IDs
    try {
      const resumeIds = searchResults.matches.map(match => match.id);
      const resumesRef = collection(db, 'resumes');
      
      // Create an array to store resume data promises
      const resumePromises = resumeIds.map(id => getDoc(doc(resumesRef, id)));
      const resumeDocs = await Promise.all(resumePromises);
      
      // Map the document snapshots to their data
      const resumes = resumeDocs
        .filter(docSnap => docSnap.exists())
        .map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            // Add the match score from Pinecone
            score: searchResults.matches.find(match => match.id === docSnap.id)?.score || 0
          };
        });

      return NextResponse.json({
        results: resumes,
        page,
        totalPages: Math.ceil(resumes.length / pageSize),
        totalResults: resumes.length,
      });
    } catch (firestoreError) {
      console.error('Error fetching resume data from Firestore:', firestoreError);
      
      // Fall back to just returning the IDs and scores if Firestore fails
      return NextResponse.json({
        results: searchResults.matches.map(match => ({ 
          id: match.id,
          score: match.score,
          metadata: match.metadata
        })),
        page,
        totalPages: 1,
        totalResults: searchResults.matches.length,
      });
    }
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search resumes' },
      { status: 500 }
    );
  }
} 
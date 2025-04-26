import { NextRequest, NextResponse } from 'next/server';
import { searchResumes } from '@/lib/pinecone';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('Search API: Request received');
    const body = await request.json();
    const { searchQuery, filters, page = 1, pageSize = 10 } = body;
    console.log('Search API: Query:', searchQuery);
    console.log('Search API: Filters:', filters);

    if (!searchQuery && (!filters || Object.keys(filters).length === 0)) {
      console.log('Search API: Error - No query or filters provided');
      return NextResponse.json(
        { error: 'Search query or filters are required' },
        { status: 400 }
      );
    }

    // 1. Search Pinecone for semantic matches using embeddings
    console.log('Search API: Searching Pinecone');
    let searchResults;
    
    try {
      searchResults = await searchResumes(searchQuery, filters, pageSize);
      console.log(`Search API: Pinecone returned ${searchResults.matches?.length || 0} matches`);
    } catch (pineconeError) {
      console.error('Search API: Error searching Pinecone:', pineconeError);
      return NextResponse.json(
        { error: 'Failed to search in vector database' },
        { status: 500 }
      );
    }
    
    if (!searchResults.matches || searchResults.matches.length === 0) {
      console.log('Search API: No matches found in Pinecone');
      return NextResponse.json({
        results: [],
        page,
        totalPages: 0,
        totalResults: 0,
      });
    }

    // 2. Get actual resume data from Firestore using the matched IDs
    try {
      console.log('Search API: Attempting to fetch data from Firestore');
      const resumeIds = searchResults.matches.map(match => match.id);
      console.log('Search API: Resume IDs:', resumeIds);
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

      console.log(`Search API: Found ${resumes.length} resumes in Firestore`);
      
      if (resumes.length > 0) {
        return NextResponse.json({
          results: resumes,
          page,
          totalPages: Math.ceil(resumes.length / pageSize),
          totalResults: resumes.length,
        });
      }
      
      // If we didn't find any resumes in Firestore, fall back to Pinecone metadata
      console.log('Search API: No matching resumes found in Firestore, falling back to Pinecone metadata');
    } catch (firestoreError) {
      console.error('Search API: Error fetching from Firestore:', firestoreError);
    }
    
    // Fall back to just returning the IDs and scores if Firestore fails
    console.log('Search API: Falling back to Pinecone metadata only');
    return NextResponse.json({
      results: searchResults.matches.map(match => ({ 
        id: match.id,
        score: match.score,
        metadata: match.metadata || {}
      })),
      page,
      totalPages: 1,
      totalResults: searchResults.matches.length,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search resumes' },
      { status: 500 }
    );
  }
} 
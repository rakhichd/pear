import { NextRequest, NextResponse } from 'next/server';
import { searchResumes } from '@/lib/pinecone';
import { promises as fs } from 'fs';
import path from 'path';

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

    // 2. Get actual resume data from local filesystem using the matched IDs
    try {
      console.log('Search API: Attempting to fetch data from local filesystem');
      const resumeIds = searchResults.matches.map(match => match.id);
      console.log('Search API: Resume IDs:', resumeIds);
      const dataDir = path.join(process.cwd(), 'data', 'resumes');
      
      // Create an array to store resume data promises
      const resumePromises = resumeIds.map(async id => {
        try {
          const metadataPath = path.join(dataDir, id, 'metadata.json');
          const fileContent = await fs.readFile(metadataPath, 'utf-8');
          const data = JSON.parse(fileContent);
          return {
            exists: true,
            id,
            data
          };
        } catch (err) {
          console.error(`Error reading resume file for ID ${id}:`, err);
          return { exists: false, id };
        }
      });
      
      const resumeDocs = await Promise.all(resumePromises);
      
      // Map the document snapshots to their data
      const resumes = resumeDocs
        .filter(doc => doc.exists)
        .map(doc => {
          return {
            id: doc.id,
            ...doc.data,
            // Add the match score from Pinecone
            score: searchResults.matches.find(match => match.id === doc.id)?.score || 0
          };
        });

      console.log(`Search API: Found ${resumes.length} resumes in local filesystem`);
      
      if (resumes.length > 0) {
        return NextResponse.json({
          results: resumes,
          page,
          totalPages: Math.ceil(resumes.length / pageSize),
          totalResults: resumes.length,
        });
      }
      
      // If we didn't find any resumes in filesystem, fall back to Pinecone metadata
      console.log('Search API: No matching resumes found in filesystem, falling back to Pinecone metadata');
    } catch (filesystemError) {
      console.error('Search API: Error fetching from filesystem:', filesystemError);
    }
    
    // Fall back to just returning the IDs and scores if filesystem fails
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
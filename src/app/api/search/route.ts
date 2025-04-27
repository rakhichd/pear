import { NextRequest, NextResponse } from 'next/server';
import { searchResumes } from '@/lib/pinecone';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';
import { ResumeData } from '@/types';
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

    // Convert filters to Pinecone format if needed
    const pineconeFilters = prepareFiltersForPinecone(filters);

    // 1. Search Pinecone for semantic matches using embeddings
    console.log('Search API: Searching Pinecone');
    let searchResults;
    
    try {
      searchResults = await searchResumes(searchQuery, pineconeFilters, pageSize);
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
        .filter(docSnap => docSnap.exists())
        .map(docSnap => {
          const data = docSnap.data() as ResumeData;
          const matchData = searchResults.matches.find(match => match.id === docSnap.id);
          
          // Use metadata from Pinecone to enhance results if available
          const pineconeMetadata = matchData?.metadata || {};
          
        .filter(doc => doc.exists)
        .map(doc => {
          return {
            id: doc.id,
            ...doc.data,
            // Add the match score from Pinecone
// <<<<<<< resumefind
            score: matchData?.score || 0,
            // Add relevance highlights based on the query
            highlights: generateHighlights(searchQuery, data.content)
// =======
//             score: searchResults.matches.find(match => match.id === doc.id)?.score || 0
// >>>>>>> main
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
    

    console.log('Search API: Falling back to Pinecone metadata only');
    return NextResponse.json({
      results: searchResults.matches.map(match => {
        const metadata = match.metadata || {};
        return { 
          id: match.id,
          score: match.score,
          title: metadata.title || '',
          role: metadata.role || '',
          experienceLevel: metadata.experienceLevel || 'mid',
          skills: metadata.skills || [],
          yearsExperience: metadata.yearsExperience || '',
          companies: metadata.companies || [],
          educationLevel: metadata.educationLevel || 'bachelor',
          education: metadata.education || '',
          interviews: metadata.interviews || [],
          offers: metadata.offers || [],
          contentPreview: metadata.contentPreview || '',
          author: metadata.author || '',
          formattingStyle: metadata.formattingStyle || 'professional',
          createdAt: metadata.createdAt || 0,
          updatedAt: metadata.updatedAt || 0
        };
      }),
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

/**
 * Convert frontend filters to Pinecone filter format
 */
function prepareFiltersForPinecone(filters: any) {
  if (!filters || Object.keys(filters).length === 0) {
    return {};
  }
  
  const pineconeFilters: any = {};
  
  // Map role filter
  if (filters.role) {
    pineconeFilters.role = filters.role;
  }
  
  // Map experience level filter
  if (filters.experienceLevel) {
    pineconeFilters.experienceLevel = filters.experienceLevel;
  }
  
  // Map education level filter
  if (filters.educationLevel) {
    pineconeFilters.educationLevel = filters.educationLevel;
  }
  
  // Map skills filter (using $in operator for array fields)
  if (filters.skills && Array.isArray(filters.skills) && filters.skills.length > 0) {
    pineconeFilters.skills = { $in: filters.skills };
  }
  
  // Map companies filter
  if (filters.companies && Array.isArray(filters.companies) && filters.companies.length > 0) {
    pineconeFilters.companies = { $in: filters.companies };
  }
  
  // Filter by isPublic: true for security
  pineconeFilters.isPublic = true;
  
  return pineconeFilters;
}

/**
 * Generate relevance highlights for search results
 */
function generateHighlights(query: string, content: string): string[] {
  if (!query || !content) {
    return [];
  }
  
  const highlights: string[] = [];
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  // Find snippets containing query terms
  if (queryTerms.length > 0) {
    const contentLower = content.toLowerCase();
    
    for (const term of queryTerms) {
      const index = contentLower.indexOf(term);
      if (index !== -1) {
        // Extract a snippet around the term
        const start = Math.max(0, index - 40);
        const end = Math.min(contentLower.length, index + term.length + 40);
        const snippet = content.substring(start, end).trim();
        
        if (snippet && !highlights.includes(snippet)) {
          highlights.push(snippet);
        }
        
        // Limit to 3 highlights
        if (highlights.length >= 3) {
          break;
        }
      }
    }
  }
  
  return highlights;
} 
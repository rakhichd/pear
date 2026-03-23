import { NextRequest, NextResponse } from 'next/server';
import { searchResumes } from '@/lib/pinecone';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { ResumeData, SearchFilter } from '@/types';
import { getResumePdfUrl } from '@/lib/resumeUtils';

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

    // Convert filters to Pinecone format if needed
    const pineconeFilters = prepareFiltersForPinecone(filters);

    // 1. Search Pinecone (integrated inference embeds the query text)
    let searchResults;

    try {
      searchResults = await searchResumes(searchQuery, pineconeFilters, pageSize);
    } catch (pineconeError) {
      console.error('Search API: Error searching Pinecone:', pineconeError);
      return NextResponse.json(
        { error: 'Failed to search in vector database' },
        { status: 500 }
      );
    }
    
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
          const data = docSnap.data() as ResumeData;
          const matchData = searchResults.matches.find(match => match.id === docSnap.id);
          const id = docSnap.id;
          const pdfUrl =
            data.pdfUrl ||
            getResumePdfUrl(id, data.category, {
              pdfFilename: data.pdfFilename,
            });

          return {
            ...data,
            id,
            pdfUrl,
            // Add the match score from Pinecone
            score: matchData?.score || 0,
            // Add relevance highlights based on the query
            highlights: generateHighlights(searchQuery, data.content)
          };
        });

      if (resumes.length > 0) {
        return NextResponse.json({
          results: resumes,
          page,
          totalPages: Math.ceil(resumes.length / pageSize),
          totalResults: resumes.length,
        });
      }
      
      // If we didn't find any resumes in Firestore, fall back to Pinecone metadata
    } catch (firestoreError) {
      console.error('Search API: Error fetching from Firestore:', firestoreError);
    }
    
    // Fall back to just returning the standardized metadata from Pinecone
    return NextResponse.json({
      results: searchResults.matches.map(match => {
        const metadata = (match.metadata ?? {}) as Record<string, unknown>;
        const str = (k: string) => (typeof metadata[k] === 'string' ? metadata[k] as string : '');
        const num = (k: string) => (typeof metadata[k] === 'number' ? metadata[k] as number : 0);
        const strArr = (k: string) => (Array.isArray(metadata[k]) ? metadata[k] as string[] : []);
        const category = str('category');
        const pdfUrl =
          str('pdfUrl') ||
          getResumePdfUrl(match.id, category || undefined, {
            pdfFilename: str('pdfFilename') || undefined,
          });
        return { 
          id: match.id,
          score: match.score,
          title: str('title'),
          role: str('role'),
          category: category || undefined,
          experienceLevel: str('experienceLevel') || 'mid',
          skills: strArr('skills'),
          yearsExperience: str('yearsExperience'),
          companies: strArr('companies'),
          educationLevel: str('educationLevel') || 'bachelor',
          education: str('education'),
          interviews: strArr('interviews'),
          offers: strArr('offers'),
          contentPreview: str('contentPreview'),
          author: str('author'),
          formattingStyle: str('formattingStyle') || 'professional',
          createdAt: num('createdAt'),
          updatedAt: num('updatedAt'),
          pdfUrl,
          pdfFilename: str('pdfFilename') || undefined,
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
function prepareFiltersForPinecone(filters: SearchFilter | Record<string, unknown> | undefined) {
  if (!filters || Object.keys(filters).length === 0) {
    return {};
  }
  
  const f = filters as Record<string, unknown>;
  const pineconeFilters: Record<string, unknown> = {};
  
  // Map role filter
  if (typeof f.role === 'string' && f.role) {
    pineconeFilters.role = f.role;
  }
  
  // Map experience level filter
  if (typeof f.experienceLevel === 'string' && f.experienceLevel) {
    pineconeFilters.experienceLevel = f.experienceLevel;
  }
  
  // Map education level filter
  if (typeof f.educationLevel === 'string' && f.educationLevel) {
    pineconeFilters.educationLevel = f.educationLevel;
  }
  
  // Map skills filter (using $in operator for array fields)
  if (Array.isArray(f.skills) && f.skills.length > 0) {
    pineconeFilters.skills = { $in: f.skills };
  }
  
  // Map companies filter
  if (Array.isArray(f.companies) && f.companies.length > 0) {
    pineconeFilters.companies = { $in: f.companies };
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
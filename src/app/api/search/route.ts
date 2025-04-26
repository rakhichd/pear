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

    // 1. Search Pinecone for semantic matches
    const searchResults = await searchResumes(searchQuery, filters, pageSize);
    
    // 2. Get actual resume data from Firestore
    // In a real implementation, this would fetch the full data for the matched IDs
    
    // Mock implementation
    const mockResumes = [
      {
        id: '1',
        title: "Software Engineer Resume",
        skills: ["React", "TypeScript", "Node.js"],
        education: "CS Degree, Berkeley",
        experience: "2-5 years",
        companies: ["Google", "Microsoft"],
        blurPreview: true,
        lastUpdated: "December 2023"
      },
      {
        id: '2',
        title: "Product Manager Resume",
        skills: ["Product Strategy", "User Research", "Roadmapping"],
        education: "MBA, Stanford",
        experience: "3-7 years",
        companies: ["Apple", "Meta"],
        blurPreview: false,
        lastUpdated: "January 2024"
      },
      {
        id: '3',
        title: "Data Scientist Resume",
        skills: ["Python", "Machine Learning", "SQL"],
        education: "Statistics, MIT",
        experience: "1-3 years",
        companies: ["Amazon", "Netflix"],
        blurPreview: true,
        lastUpdated: "February 2024"
      },
    ];

    return NextResponse.json({
      results: mockResumes,
      page,
      totalPages: 1,
      totalResults: mockResumes.length,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search resumes' },
      { status: 500 }
    );
  }
} 
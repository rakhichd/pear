"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MagnifyingGlassIcon, ArrowTopRightOnSquareIcon, DocumentTextIcon, TagIcon, BriefcaseIcon, ArrowLongRightIcon } from "@heroicons/react/24/outline";

export default function SimpleSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting search with query:", searchQuery);
      
      // Direct API call without embedding processing
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery,
          filters: {},
          page: 1,
          pageSize: 20,
        }),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Search request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received data:", data);
      setResults(data.results || []);

      // Update URL with the search query
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('q', searchQuery);
      const newRelativePathQuery = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.pushState(null, '', newRelativePathQuery);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(`Failed to search resumes: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press for search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Function to view a specific resume
  const viewResume = (resumeId: string) => {
    router.push(`/resume/${resumeId}`);
  };

  // Extract skills from resume
  const extractSkills = (resume: any) => {
    if (resume.skills && Array.isArray(resume.skills)) {
      return resume.skills;
    }
    
    // Try to extract skills from content if available
    const content = resume.content || resume.metadata?.content || '';
    if (content) {
      // This is a simple extraction - you can implement more sophisticated extraction
      const commonSkills = ['JavaScript', 'Python', 'Java', 'React', 'SQL', 'AWS', 'Node.js'];
      return commonSkills.filter(skill => content.toLowerCase().includes(skill.toLowerCase()));
    }
    
    return [];
  };

  // Check for query parameter when the component mounts
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
      // Wait a moment for component to fully initialize before searching
      const timer = setTimeout(() => {
        handleSearch();
      }, 100);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Intentionally excluding handleSearch to prevent infinite loop

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            ResumeFind
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-4" />
            <input 
              type="text"
              placeholder="Search by role, skills, company, background..."
              className="flex-1 px-4 py-3 focus:outline-none text-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="bg-indigo-600 text-white px-6 py-3 font-medium hover:bg-indigo-700 transition"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-xs text-gray-500 mt-1">
                Try searching for another term or refreshing the page.
              </p>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            {isLoading ? 'Searching...' : 
             results.length > 0 ? `Found ${results.length} matching resumes` : 
             'Enter a search query to find resumes'}
          </h2>
          
          {/* Results List */}
          <div className="space-y-4">
            {results.map((resume) => {
              const skills = extractSkills(resume);
              return (
                <div 
                  key={resume.id} 
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-indigo-600">
                      {resume.title || resume.metadata?.title || "Untitled Resume"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">
                        Match Score: {(resume.score * 100).toFixed(0)}%
                      </span>
                      <button 
                        onClick={() => viewResume(resume.id)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="View full resume"
                      >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2 items-center text-sm text-gray-600">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {resume.category || resume.metadata?.category || "General"}
                    </span>
                    
                    {resume.source && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>{resume.source}</span>
                      </>
                    )}
                    
                    {resume.id && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-xs">{resume.id}</span>
                      </>
                    )}
                  </div>
                  
                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1 items-center">
                      <TagIcon className="h-4 w-4 text-gray-500" />
                      {skills.map(skill => (
                        <span 
                          key={skill} 
                          className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {(resume.content || resume.metadata?.content) && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {(resume.content || resume.metadata?.content).substring(0, 300)}...
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => viewResume(resume.id)}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View Full Resume
                      <ArrowLongRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {results.length === 0 && !isLoading && searchQuery.trim() && (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-600 mb-2">No resumes found matching your search criteria.</p>
                <p className="text-gray-500 text-sm">Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { processSearchQuery } from "@/utils/textProcessing";
import Header from "@/app/components/Header";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    role: "",
    skills: [] as string[],
    education: "",
    experienceLevel: "",
    companies: [] as string[],
  });
  
  const [newSkill, setNewSkill] = useState("");
  const [newCompany, setNewCompany] = useState("");

  // Handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim() && Object.values(filters).every(v => !v || (Array.isArray(v) && v.length === 0))) {
      setError("Please enter a search query or apply filters");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Starting search with query:", searchQuery);
      
      // Process the query text to make it suitable for embeddings
      const processedQuery = processSearchQuery(searchQuery);
      console.log("Processed query:", processedQuery);
      
      // Prepare filter object for the API
      const filterPayload = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && (!Array.isArray(value) || value.length > 0)) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      console.log("Filter payload:", filterPayload);
      
      // Call the search API
      console.log("Sending request to API");
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery: processedQuery,
          filters: filterPayload,
          page: 1,
          pageSize: 10,
        }),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Search request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Received data:", data);
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError("Failed to search resumes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle adding a skill to filters
  const addSkill = () => {
    if (newSkill.trim() && !filters.skills.includes(newSkill)) {
      setFilters({
        ...filters,
        skills: [...filters.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };
  
  // Handle removing a skill from filters
  const removeSkill = (skill: string) => {
    setFilters({
      ...filters,
      skills: filters.skills.filter(s => s !== skill),
    });
  };
  
  // Handle adding a company to filters
  const addCompany = () => {
    if (newCompany.trim() && !filters.companies.includes(newCompany)) {
      setFilters({
        ...filters,
        companies: [...filters.companies, newCompany.trim()],
      });
      setNewCompany("");
    }
  };
  
  // Handle removing a company from filters
  const removeCompany = (company: string) => {
    setFilters({
      ...filters,
      companies: filters.companies.filter(c => c !== company),
    });
  };

  // Handle key press for search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-1/4 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Role/Title</h4>
              <input 
                type="text" 
                placeholder="E.g. Software Engineer" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              />
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
              <div className="flex mb-2">
                <input 
                  type="text" 
                  placeholder="Add a skill" 
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-gray-700"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <button 
                  className="bg-indigo-600 text-white px-3 rounded-r-md hover:bg-indigo-700"
                  onClick={addSkill}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.skills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs flex items-center">
                    {skill}
                    <button 
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Education</h4>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                value={filters.education}
                onChange={(e) => setFilters({...filters, education: e.target.value})}
              >
                <option value="">Any Education</option>
                <option value="High School">High School</option>
                <option value="Associate">Associate's Degree</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h4>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
                value={filters.experienceLevel}
                onChange={(e) => setFilters({...filters, experienceLevel: e.target.value})}
              >
                <option value="">Any Experience</option>
                <option value="0-1">0-1 years</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Companies</h4>
              <div className="flex mb-2">
                <input 
                  type="text" 
                  placeholder="Add a company" 
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-gray-700"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCompany()}
                />
                <button 
                  className="bg-indigo-600 text-white px-3 rounded-r-md hover:bg-indigo-700"
                  onClick={addCompany}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.companies.map(company => (
                  <span key={company} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs flex items-center">
                    {company}
                    <button 
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                      onClick={() => removeCompany(company)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button 
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
              onClick={handleSearch}
              disabled={isLoading}
            >
              Apply Filters
            </button>
          </div>

          {/* Search Results */}
          <div className="lg:w-3/4">
            <h2 className="text-xl font-bold mb-4">
              {isLoading ? 'Searching...' : 
               results.length > 0 ? `Found ${results.length} results` : 
               'Enter a search query to find resumes'}
            </h2>
            
            {/* Results List */}
            <div className="space-y-4">
              {results.map(resume => (
                <div key={resume.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-indigo-600">
                      {resume.title || "Untitled Resume"}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {resume.lastUpdated ? `Updated: ${resume.lastUpdated}` : ""}
                    </span>
                  </div>
                  
                  {/* Skills */}
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {resume.skills.map((skill: string) => (
                          <span key={skill} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Education and Experience */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {resume.education && (
                      <div>
                        <p className="text-sm text-gray-600">Education:</p>
                        <p className="text-sm">{resume.education}</p>
                      </div>
                    )}
                    {resume.experience && (
                      <div>
                        <p className="text-sm text-gray-600">Experience:</p>
                        <p className="text-sm">{resume.experience}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Companies */}
                  {resume.companies && resume.companies.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Companies:</p>
                      <div className="flex flex-wrap gap-1">
                        {resume.companies.map((company: string) => (
                          <span key={company} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Preview or View button */}
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/main/resumes/${resume.id}`}
                      className={`px-4 py-2 rounded ${
                        resume.blurPreview
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      } transition`}
                    >
                      {resume.blurPreview ? "Unlock Preview" : "View Resume"}
                    </Link>
                  </div>
                </div>
              ))}
              
              {results.length === 0 && !isLoading && searchQuery.trim() && (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                  <p className="text-gray-600 mb-2">No resumes found matching your search criteria.</p>
                  <p className="text-gray-500 text-sm">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
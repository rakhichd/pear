"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, DocumentTextIcon, TagIcon, ClockIcon, BuildingOfficeIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export default function ResumePage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;
  
  const [resume, setResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch the resume data
  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the resume data from the API
        const response = await fetch(`/api/resume/${resumeId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch resume: ${response.status}`);
        }
        
        const data = await response.json();
        setResume(data.resume);
      } catch (err: any) {
        console.error("Error fetching resume:", err);
        setError(`Could not load resume: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResume();
  }, [resumeId]);
  
  // Format the resume content for display
  const formatContent = (content: string) => {
    if (!content) return null;
    
    // Split by newlines and add paragraph elements
    return content.split("\n").map((line, index) => 
      line.trim() ? <p key={index} className="mb-2">{line}</p> : <br key={index} />
    );
  };
  
  // Extract skills from content
  const extractSkills = (content: string) => {
    if (!content) return [];
    
    // Simple skill extraction - you can enhance this with better NLP
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django',
      'SQL', 'MongoDB', 'PostgreSQL', 'Firebase', 'AWS', 'Azure',
      'TensorFlow', 'PyTorch', 'Machine Learning', 'AI',
      'Agile', 'Scrum', 'Project Management', 'Team Leadership'
    ];
    
    return commonSkills.filter(skill => 
      content.toLowerCase().includes(skill.toLowerCase())
    );
  };
  
  // Go back to search results
  const goBack = () => {
    router.back();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            ResumeFind
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <button 
          onClick={goBack}
          className="mb-6 flex items-center text-gray-600 hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to search results
        </button>
        
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-700">{error}</p>
            <button 
              onClick={goBack}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        ) : resume ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Resume Header */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {resume.title || "Untitled Resume"}
              </h1>
              <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">
                <span className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  {resume.category || "General"}
                </span>
                
                {resume.source && (
                  <span className="flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                    {resume.source}
                  </span>
                )}
                
                {resume.lastUpdated && (
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Updated: {new Date(resume.lastUpdated).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            {/* Skills Section */}
            {resume.content && (
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-3 text-gray-900 flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {extractSkills(resume.content).map(skill => (
                    <span 
                      key={skill}
                      className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {extractSkills(resume.content).length === 0 && (
                    <span className="text-gray-500 italic">No skills detected</span>
                  )}
                </div>
              </div>
            )}
            
            {/* Resume Content */}
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Resume Content</h2>
              <div className="prose max-w-none text-gray-700">
                {formatContent(resume.content || '')}
                {!resume.content && (
                  <p className="text-gray-500 italic">No content available</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Resume Not Found</h2>
            <p className="text-gray-700">The requested resume could not be found.</p>
            <button 
              onClick={goBack}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, DocumentTextIcon, TagIcon, ClockIcon, BuildingOfficeIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { getResumePdfUrl } from "@/lib/resumeUtils";
import type { ResumeDetail } from "@/types";

export default function ResumeDetailClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawId = params?.id;
  const resumeId = typeof rawId === 'string' ? rawId : '';
  const categoryFromSearch = searchParams?.get("category")?.trim() || undefined;
  
  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/resume/${resumeId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch resume: ${response.status}`);
        }
        
        const data = await response.json();
        setResume(data.resume as ResumeDetail);
      } catch (err: unknown) {
        console.error("Error fetching resume:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(`Could not load resume: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResume();
  }, [resumeId]);
  
  const extractSkills = (content: string) => {
    if (!content) return [];
    
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
  
  const getPdfUrl = (r: ResumeDetail) => {
    const id = r.id ?? resumeId;
    return getResumePdfUrl(id, r.category || categoryFromSearch, {
      pdfUrl: r.pdfUrl,
      pdfFilename: r.pdfFilename,
    });
  };

  const fallbackPdfUrl =
    categoryFromSearch &&
    getResumePdfUrl(resumeId, categoryFromSearch, undefined);
  
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
        ) : error && fallbackPdfUrl ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-amber-800 mb-2">Limited view</h2>
              <p className="text-gray-600 text-sm">{error}</p>
              <p className="text-gray-500 text-sm mt-2">
                Showing the PDF from your search result. If this is wrong, check that Firestore contains this resume ID.
              </p>
            </div>
            <div className="p-6">
              <div className="flex justify-end mb-4">
                <a
                  href={fallbackPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
                  Open PDF
                </a>
              </div>
              <div className="w-full h-[800px] border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={fallbackPdfUrl}
                  className="w-full h-full"
                  title="Resume PDF"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={goBack}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Go Back
              </button>
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
            
            <div className="p-6">
              <div className="flex justify-end mb-4">
                <a 
                  href={getPdfUrl(resume)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
                  Download PDF
                </a>
              </div>
              
              <div className="w-full h-[800px] border border-gray-200 rounded-lg overflow-hidden">
                <iframe 
                  src={getPdfUrl(resume)} 
                  className="w-full h-full" 
                  title={`${resume.title || 'Resume'} PDF`}
                ></iframe>
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

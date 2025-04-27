"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, DocumentTextIcon, TagIcon, ClockIcon, BuildingOfficeIcon, AcademicCapIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { getCurrentUserId, isLoggedIn } from "@/utils/auth-helpers";

export default function ResumePage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  
  const [resume, setResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingResume, setSavingResume] = useState(false);
  
  // Fetch the resume data and check if it's saved
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
        const resumeData = data.resume;
        setResume(resumeData);
        
        // Since we have the resume data, immediately save it to localStorage
        // so it can be accessed from the profile page
        try {
          const savedResumesData = JSON.parse(localStorage.getItem('savedResumesData') || '{}');
          savedResumesData[resumeId] = {
            id: resumeId,
            title: resumeData.title || 'Untitled Resume',
            skills: extractSkills(resumeData.content || ''),
            education: 'Not specified',
            experienceLevel: 'Not specified',
            companies: ['Not specified'],
            category: resumeData.category || 'General',
            content: resumeData.content || ''
          };
          localStorage.setItem('savedResumesData', JSON.stringify(savedResumesData));
        } catch (storageError) {
          console.error('Error storing resume data in localStorage:', storageError);
        }
        
        // Check if this resume is saved for the current user
        if (isLoggedIn()) {
          // First try API
          try {
            const userId = getCurrentUserId();
            const savedResponse = await fetch(`/api/resumes/saved?userId=${userId}`);
            if (savedResponse.ok) {
              const savedData = await savedResponse.json();
              const isSavedResume = savedData.savedResumes.some((saved: any) => saved.id === resumeId);
              setIsSaved(isSavedResume);
            }
          } catch (apiError) {
            // Fallback to localStorage
            const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
            setIsSaved(savedResumes.includes(resumeId));
          }
        }
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
  
  // Toggle save resume
  const toggleSave = async () => {
    // Force check login status
    const loggedIn = isLoggedIn();
    console.log('Login status:', loggedIn);
    
    if (!loggedIn) {
      console.log('Not logged in, redirecting to login page');
      // Store the current resume ID so we can return to it after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('resumeToSaveAfterLogin', resumeId);
      }
      router.push('/auth/login');
      return;
    }
    
    setSavingResume(true);
    const userId = getCurrentUserId();
    console.log('Current user ID:', userId);
    
    try {
      if (isSaved) {
        // Remove from saved
        try {
          const response = await fetch(`/api/resumes/saved?userId=${userId}&resumeId=${resumeId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            setIsSaved(false);
            // Also update localStorage as fallback
            const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
            localStorage.setItem('savedResumes', JSON.stringify(savedResumes.filter(id => id !== resumeId)));
          } else {
            throw new Error('API request failed');
          }
        } catch (apiError) {
          // Fallback to localStorage only
          const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
          localStorage.setItem('savedResumes', JSON.stringify(savedResumes.filter(id => id !== resumeId)));
          setIsSaved(false);
        }
      } else {
        // Add to saved
        try {
          const response = await fetch('/api/resumes/saved', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, resumeId })
          });
          
          if (response.ok) {
            setIsSaved(true);
            // Also update localStorage as fallback
            const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
            if (!savedResumes.includes(resumeId)) {
              savedResumes.push(resumeId);
              localStorage.setItem('savedResumes', JSON.stringify(savedResumes));
            }
            
            // Store resume data in localStorage for profile page
            if (resume) {
              try {
                const savedResumesData = JSON.parse(localStorage.getItem('savedResumesData') || '{}');
                savedResumesData[resumeId] = {
                  id: resumeId,
                  title: resume.title || 'Untitled Resume',
                  skills: extractSkills(resume.content || ''),
                  content: resume.content,
                  category: resume.category,
                  education: 'Not specified',
                  experienceLevel: 'Not specified',
                  companies: ['Not specified']
                };
                localStorage.setItem('savedResumesData', JSON.stringify(savedResumesData));
              } catch (storageError) {
                console.error('Error storing resume data:', storageError);
              }
            }
          } else {
            throw new Error('API request failed');
          }
        } catch (apiError) {
          // Fallback to localStorage only
          const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
          if (!savedResumes.includes(resumeId)) {
            savedResumes.push(resumeId);
            localStorage.setItem('savedResumes', JSON.stringify(savedResumes));
          }
          
          // Store resume data in localStorage for profile page
          if (resume) {
            try {
              const savedResumesData = JSON.parse(localStorage.getItem('savedResumesData') || '{}');
              savedResumesData[resumeId] = {
                id: resumeId,
                title: resume.title || 'Untitled Resume',
                skills: extractSkills(resume.content || ''),
                content: resume.content,
                category: resume.category,
                education: 'Not specified',
                experienceLevel: 'Not specified',
                companies: ['Not specified']
              };
              localStorage.setItem('savedResumesData', JSON.stringify(savedResumesData));
            } catch (storageError) {
              console.error('Error storing resume data:', storageError);
            }
          }
          
          setIsSaved(true);
        }
      }
    } catch (err) {
      console.error('Error toggling saved state:', err);
    } finally {
      setSavingResume(false);
    }
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
              <div className="flex justify-between items-start">
                <div>
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
                
                <button 
                  onClick={toggleSave}
                  disabled={savingResume}
                  className={`p-2 rounded-full transition-colors ${isSaved ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                  title={isSaved ? "Remove from saved" : "Save resume"}
                >
                  {isSaved ? (
                    <BookmarkSolidIcon className="h-6 w-6" />
                  ) : (
                    <BookmarkIcon className="h-6 w-6" />
                  )}
                </button>
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
"use client";

import Link from 'next/link';
import { ArrowLeftIcon, DocumentDuplicateIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

import { use } from 'react';

export default function ResumeDetailPage({ params }: { params: { id: string } }) {
  const [isSaved, setIsSaved] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params);
  
  // Mock resume data
  const resumeData = {
    id: unwrappedParams.id,
    title: "Senior Software Engineer Resume",
    author: "Anonymous User",
    lastUpdated: "December 2023",
    education: "B.S. Computer Science, UC Berkeley",
    yearsExperience: "5+ years",
    skills: ["React", "TypeScript", "Node.js", "AWS", "Python", "GraphQL"],
    offers: ["Google", "Meta", "Amazon"],
    interviews: ["Apple", "Microsoft", "Netflix"],
    content: `
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-2">EDUCATION</h3>
        <p><strong>University of California, Berkeley</strong> - B.S. Computer Science, 2018</p>
        <p class="text-sm">GPA: 3.8/4.0, Dean's List all semesters</p>
      </div>
      
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-2">EXPERIENCE</h3>
        
        <div class="mb-4">
          <p class="font-semibold">Senior Software Engineer | Meta</p>
          <p class="text-sm">June 2021 - Present</p>
          <ul class="list-disc pl-5 mt-2 text-sm">
            <li>Led development of React-based frontend for new advertising analytics platform</li>
            <li>Implemented real-time data visualization components reducing load time by 40%</li>
            <li>Mentored junior engineers and conducted technical interviews</li>
          </ul>
        </div>
  useEffect(() => {
    // Fetch the resume data from the API
    const fetchResume = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/resume/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch resume');
        }
        
        const data = await response.json();
        
        if (data.resume) {
          setResumeData({
            id: data.resume.id,
            title: data.resume.title || `Resume for ${data.resume.role || 'Unknown Role'}`,
            author: "Anonymous User",
            lastUpdated: new Date(data.resume.updatedAt || Date.now()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            education: data.resume.education || "Not specified",
            yearsExperience: data.resume.experience || "Not specified",
            skills: Array.isArray(data.resume.skills) ? data.resume.skills : 
                   typeof data.resume.skills === 'string' ? data.resume.skills.split(',').map((s: string) => s.trim()) : 
                   ["No skills listed"],
            role: data.resume.role || "Not specified",
            fileName: data.resume.fileName || "",
            result: data.resume.result || "",
            filePath: data.resume.filePath || "",
            company: data.resume.company || "",
            // Use placeholder content for now
            content: `
              <div class="mb-6">
                <h3 class="text-lg font-bold mb-2">ROLE</h3>
                <p>${data.resume.role || "Not specified"}</p>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-bold mb-2">RESULT</h3>
                <p>${data.resume.result || "Not specified"}</p>
              </div>
              
              ${data.resume.education ? `
              <div class="mb-6">
                <h3 class="text-lg font-bold mb-2">EDUCATION</h3>
                <p>${data.resume.education}</p>
              </div>
              ` : ''}
              
              ${data.resume.company ? `
              <div class="mb-6">
                <h3 class="text-lg font-bold mb-2">COMPANY</h3>
                <p>${data.resume.company}</p>
              </div>
              ` : ''}
              
              ${data.resume.experiences ? `
              <div class="mb-6">
                <h3 class="text-lg font-bold mb-2">EXPERIENCES</h3>
                <p>${data.resume.experiences}</p>
              </div>
              ` : ''}
            `,
            interviews: [],
            offers: data.resume.result ? [data.resume.result] : []
          });
        } else {
          throw new Error('Resume not found');
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Failed to load resume. It might have been deleted or moved.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResume();
  }, [params.id]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, you would call an API to save this resume to the user's account
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Resume Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "We couldn't find the resume you're looking for."}</p>
            <Link 
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show PDF embed if there's a file path
  const pdfLink = resumeData.filePath ? `/data${resumeData.filePath}` : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            ResumeFind
          </Link>
          <div className="flex gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Link 
              href="/auth/signup"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Link href="/main/search" className="flex items-center text-indigo-600 hover:text-indigo-800">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to search results
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-8">
          {/* Resume Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-bold mb-2">{resumeData.title}</h1>
                <p className="text-gray-600">By {resumeData.author} • Updated {resumeData.lastUpdated}</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <button 
                  onClick={handleSave}
                  className="flex items-center text-gray-700 hover:text-indigo-600"
                >
                  {isSaved ? (
                    <StarIconSolid className="h-5 w-5 text-yellow-500 mr-1" />
                  ) : (
                    <StarIcon className="h-5 w-5 mr-1" />
                  )}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                
                {pdfLink && (
                  <a 
                    href={pdfLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    View PDF
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Resume Metadata */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Role</h3>
                <p className="text-gray-900">{resumeData.role}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Education</h3>
                <p className="text-gray-900">{resumeData.education}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Results</h3>
                <div className="flex flex-wrap gap-1">
                  {resumeData.offers.map((company, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Resume Content */}
          <div className="p-6">
            {pdfLink ? (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">PDF Resume</h3>
                <div className="w-full h-96 border border-gray-300 rounded-md overflow-hidden">
                  <iframe src={pdfLink} className="w-full h-full"></iframe>
                </div>
              </div>
            ) : null}
            <div dangerouslySetInnerHTML={{ __html: resumeData.content }} />
          </div>
        </div>
        
        {/* Success Stats */}
        <div className="bg-indigo-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3 text-indigo-900">Success Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-indigo-700 mb-2">Results</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.offers.map((company, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Share Your Own Success Story</h2>
          <p className="mb-6 max-w-2xl mx-auto">Help others in their job search by sharing your own successful resume.</p>
          <Link 
            href="/main/resume/upload" 
            className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-md font-medium hover:bg-gray-100 transition"
          >
            Upload Your Resume
          </Link>
        </div>
      </main>
    </div>
  );
} 
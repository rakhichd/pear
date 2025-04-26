"use client";

import Link from 'next/link';
import { ArrowLeftIcon, DocumentDuplicateIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function ResumeDetailPage({ params }: { params: { id: string } }) {
  const [isSaved, setIsSaved] = useState(false);
  
  // Mock resume data
  const resumeData = {
    id: params.id,
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
        
        <div class="mb-4">
          <p class="font-semibold">Software Engineer | Dropbox</p>
          <p class="text-sm">August 2018 - May 2021</p>
          <ul class="list-disc pl-5 mt-2 text-sm">
            <li>Developed and maintained RESTful APIs serving 10k+ requests per second</li>
            <li>Migrated legacy Python services to TypeScript microservices architecture</li>
            <li>Improved test coverage from 65% to 92% across core services</li>
          </ul>
        </div>
        
        <div class="mb-4">
          <p class="font-semibold">Software Engineering Intern | Google</p>
          <p class="text-sm">Summer 2017</p>
          <ul class="list-disc pl-5 mt-2 text-sm">
            <li>Implemented new features for internal tools used by 5000+ engineers</li>
            <li>Created automated testing framework reducing QA time by 20%</li>
          </ul>
        </div>
      </div>
      
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-2">SKILLS</h3>
        <p><strong>Languages:</strong> JavaScript/TypeScript, Python, Go, SQL, HTML/CSS</p>
        <p><strong>Frameworks:</strong> React, Node.js, Express, Next.js, Django</p>
        <p><strong>Tools:</strong> AWS, Docker, Kubernetes, Git, CI/CD pipelines</p>
      </div>
      
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-2">PROJECTS</h3>
        
        <div class="mb-4">
          <p class="font-semibold">Open Source Contribution | React Performance Monitor</p>
          <ul class="list-disc pl-5 mt-2 text-sm">
            <li>Created developer tool extension with 5000+ weekly users</li>
            <li>Optimized rendering performance for complex React applications</li>
          </ul>
        </div>
        
        <div class="mb-4">
          <p class="font-semibold">Personal Project | AI Code Assistant</p>
          <ul class="list-disc pl-5 mt-2 text-sm">
            <li>Built ML-powered VSCode extension for code suggestions</li>
            <li>Implemented transformers model fine-tuned on open source repositories</li>
          </ul>
        </div>
      </div>
    `,
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, you would call an API to save this resume to the user's account
  };

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
                
                <button className="flex items-center text-gray-700 hover:text-indigo-600">
                  <DocumentDuplicateIcon className="h-5 w-5 mr-1" />
                  Copy
                </button>
                
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
          
          {/* Resume Metadata */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Education</h3>
                <p className="text-gray-900">{resumeData.education}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Experience</h3>
                <p className="text-gray-900">{resumeData.yearsExperience}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Offers Received</h3>
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
            <div dangerouslySetInnerHTML={{ __html: resumeData.content }} />
          </div>
        </div>
        
        {/* Success Stats */}
        <div className="bg-indigo-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3 text-indigo-900">Success Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-indigo-700 mb-2">Offers Received</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.offers.map((company, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    {company}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-indigo-700 mb-2">Interviews</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.interviews.map((company, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Resumes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Similar Resumes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="p-4">
                  <h3 className="font-medium mb-2">{`${item === 1 ? 'Senior' : item === 2 ? 'Staff' : 'Principal'} Software Engineer Resume`}</h3>
                  <p className="text-sm text-gray-600 mb-3">{`${5 + item} years experience • ${item === 1 ? 'Google' : item === 2 ? 'Microsoft' : 'Amazon'} offer`}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {['React', 'TypeScript', 'Cloud'].map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/main/resume/${item + 10}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Resume →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Unlock All Premium Resumes</h2>
          <p className="mb-6 max-w-2xl mx-auto">Get unlimited access to our database of successful resumes that landed real offers at top companies.</p>
          <Link 
            href="/auth/signup" 
            className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-md font-medium hover:bg-gray-100 transition"
          >
            Sign Up Now
          </Link>
        </div>
      </main>
    </div>
  );
} 
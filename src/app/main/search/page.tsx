"use client";

import { useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

export default function SearchPage() {
  const [filters, setFilters] = useState({
    role: "",
    skills: [],
    education: "",
    experienceLevel: "",
    companies: [],
  });

  // Mock search results for UI demonstration
  const mockResults = [
    {
      id: "1",
      title: "Software Engineer Resume",
      skills: ["React", "TypeScript", "Node.js"],
      education: "CS Degree, Berkeley",
      experience: "2-5 years",
      companies: ["Google", "Microsoft"],
      blurPreview: true
    },
    {
      id: "2",
      title: "Product Manager Resume",
      skills: ["Product Strategy", "User Research", "Roadmapping"],
      education: "MBA, Stanford",
      experience: "3-7 years",
      companies: ["Apple", "Meta"],
      blurPreview: false
    },
    {
      id: "3",
      title: "Data Scientist Resume",
      skills: ["Python", "Machine Learning", "SQL"],
      education: "Statistics, MIT",
      experience: "1-3 years",
      companies: ["Amazon", "Netflix"],
      blurPreview: true
    },
  ];

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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-4" />
            <input 
              type="text"
              placeholder="Search by role, skills, company, background..."
              className="flex-1 px-4 py-3 focus:outline-none text-gray-800"
              defaultValue="Software Engineer"
            />
            <button className="bg-indigo-600 text-white px-6 py-3 font-medium hover:bg-indigo-700 transition">
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Panel */}
          <div className="w-full md:w-64 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
            </div>

            {/* Role Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Role</h4>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700">
                <option>Any Role</option>
                <option>Software Engineer</option>
                <option>Product Manager</option>
                <option>Data Scientist</option>
                <option>Designer</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="entry" className="mr-2" />
                  <label htmlFor="entry" className="text-gray-700">Entry (0-2 years)</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="mid" className="mr-2" />
                  <label htmlFor="mid" className="text-gray-700">Mid-Level (2-5 years)</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="senior" className="mr-2" />
                  <label htmlFor="senior" className="text-gray-700">Senior (5+ years)</label>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="react" className="mr-2" />
                  <label htmlFor="react" className="text-gray-700">React</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="python" className="mr-2" />
                  <label htmlFor="python" className="text-gray-700">Python</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="productMgmt" className="mr-2" />
                  <label htmlFor="productMgmt" className="text-gray-700">Product Management</label>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Education</h4>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700">
                <option>Any Education</option>
                <option>High School</option>
                <option>Associate's</option>
                <option>Bachelor's</option>
                <option>Master's</option>
                <option>PhD</option>
              </select>
            </div>

            {/* Companies */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Companies</h4>
              <input 
                type="text" 
                placeholder="Enter company name" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 mb-2"
              />
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs flex items-center">
                  Google
                  <button className="ml-1 text-indigo-600 hover:text-indigo-800">×</button>
                </span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs flex items-center">
                  Microsoft
                  <button className="ml-1 text-indigo-600 hover:text-indigo-800">×</button>
                </span>
              </div>
            </div>

            <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
              Apply Filters
            </button>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <p className="text-gray-600 mb-6">Showing {mockResults.length} results for "Software Engineer"</p>

            <div className="space-y-6">
              {mockResults.map((result) => (
                <div key={result.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Education:</span> {result.education}
                      </div>
                      <div>
                        <span className="font-medium">Experience:</span> {result.experience}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Companies:</span> {result.companies.join(", ")}
                      </div>
                    </div>
                    
                    {/* Preview with blur effect for unpaid users */}
                    <div className="relative h-36 bg-gray-100 mb-4 overflow-hidden">
                      <div className={`absolute inset-0 flex items-center justify-center ${result.blurPreview ? "backdrop-blur-md" : ""}`}>
                        {result.blurPreview ? (
                          <div className="text-center">
                            <p className="text-gray-800 font-medium mb-2">Premium Content</p>
                            <button className="px-4 py-1 bg-indigo-600 text-white rounded-md text-sm">
                              Sign Up to View
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 w-full">
                            {/* This would be the resume preview content */}
                            <p className="text-sm text-gray-700">Sample resume content visible to users...</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Updated Dec 2023
                      </div>
                      <Link 
                        href={`/resume/${result.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm"
                      >
                        View Full Resume
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
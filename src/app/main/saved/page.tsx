"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { getCurrentUserId } from "@/utils/auth-helpers";

export default function SavedResumesPage() {
  const [user, setUser] = useState<any>(null);
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Use a consistent userId for demo purposes
  const [userId, setUserId] = useState(() => getCurrentUserId());

  useEffect(() => {
    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
      } else {
        // Always use a demo ID for testing
        setUserId(getCurrentUserId());
      }

      // Fetch saved resumes regardless of authentication status
      fetchSavedResumes();
    });

    return () => unsubscribe();
  }, []);
  
  // Refetch when userId changes
  useEffect(() => {
    fetchSavedResumes();
  }, [userId]);

  // Fetch saved resumes
  const fetchSavedResumes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/resumes/saved?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved resumes');
      }
      
      const data = await response.json();
      setSavedResumes(data.savedResumes || []);
    } catch (err) {
      console.error('Error fetching saved resumes:', err);
      setError('Failed to load your saved resumes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a resume from saved list
  const handleRemove = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/saved?userId=${userId}&resumeId=${resumeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove saved resume');
      }
      
      // Update the local state to remove the deleted resume
      setSavedResumes(savedResumes.filter(resume => resume.id !== resumeId));
    } catch (err) {
      console.error('Error removing saved resume:', err);
      setError('Failed to remove resume from saved list. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/main/search" className="flex items-center text-indigo-600 hover:text-indigo-800">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to search
            </Link>
            <h1 className="text-2xl font-bold ml-4">Saved Resumes</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : savedResumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResumes.map(resume => (
              <div key={resume.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-indigo-600">
                      {resume.title || "Untitled Resume"}
                    </h2>
                    <button 
                      onClick={() => handleRemove(resume.id)}
                      className="text-gray-400 hover:text-yellow-500"
                      title="Remove from saved"
                    >
                      <StarIconSolid className="h-5 w-5 text-yellow-500" />
                    </button>
                  </div>
                  
                  {/* Skills */}
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {resume.skills.slice(0, 5).map((skill: string) => (
                          <span key={skill} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                        {resume.skills.length > 5 && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            +{resume.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Education and Experience */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {resume.education && (
                      <div>
                        <p className="text-sm text-gray-600">Education:</p>
                        <p className="text-sm truncate">{resume.education}</p>
                      </div>
                    )}
                    {resume.experienceLevel && (
                      <div>
                        <p className="text-sm text-gray-600">Experience:</p>
                        <p className="text-sm">{resume.experienceLevel}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Companies */}
                  {resume.companies && resume.companies.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Companies:</p>
                      <div className="flex flex-wrap gap-1">
                        {resume.companies.slice(0, 3).map((company: string) => (
                          <span key={company} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                            {company}
                          </span>
                        ))}
                        {resume.companies.length > 3 && (
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                            +{resume.companies.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* View button */}
                  <div className="mt-4">
                    <Link
                      href={`/main/resume/${resume.id}`}
                      className="w-full block text-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      View Resume
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No saved resumes yet</h2>
            <p className="text-gray-600 mb-6">Start exploring and save resumes that interest you.</p>
            <Link
              href="/main/search"
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Browse Resumes
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
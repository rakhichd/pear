'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function UploadSuccess() {
  const searchParams = useSearchParams();
  const [resumeId, setResumeId] = useState<string | null>(null);
  
  useEffect(() => {
    // Get resumeId from URL query params
    const id = searchParams.get('id');
    if (id) {
      setResumeId(id);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Resume Uploaded Successfully!</h1>
          
          <p className="text-gray-600 mb-8 text-lg">
            Thank you for contributing to our community! Your resume will help others in their job search journey.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
            {resumeId && (
              <Link
                href={`/main/resume/${resumeId}`}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                View Your Resume
              </Link>
            )}
            
            <Link
              href="/main/search"
              className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Browse Other Resumes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
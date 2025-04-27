'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function UploadResume() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    role: '',
    company: '',
    experiences: '',
    education: '',
    skills: '',
    result: '',
  });
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      // Check if file is PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        setFile(null);
        setFileName('');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        setFile(null);
        setFileName('');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload a resume file');
      return;
    }
    
    try {
      setUploading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('result', formData.result);
      
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formDataToSend,
      });
  
      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload resume');
        throw new Error(errorData.error || 'Failed to upload resume');
      }
  
      const data = await response.json();
      router.push(`/main/resume/upload/success?id=${data.resumeId}`);
      
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };
   

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

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Upload Your Succesful Resume</h1>
          <p className="text-gray-600 mb-8">
            Share your resume to help others in their job search journey.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Upload Resume (PDF only) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition cursor-pointer">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {fileName ? (
                    <div className="flex items-center justify-center">
                      <DocumentTextIcon className="h-8 w-8 text-indigo-500 mr-2" />
                      <span className="text-gray-700">{fileName}</span>
                    </div>
                  ) : (
                    <>
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-1">Drag and drop your PDF file here or click to browse</p>
                      <p className="text-gray-500 text-sm">Max file size: 5MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="E.g., Software Engineer, Product Manager"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Result (interviews/offers) *
              </label>
              <textarea
                name="result"
                value={formData.result}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="E.g., Received offers from Google and Meta, interview at Amazon"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function ResumeFeedback() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    targetRole: '',
    targetCompany: '',
    careerLevel: 'entry',
    additionalContext: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      setLoading(true);
      setFeedback(null);
      
      // 1. Upload the file and metadata using FormData
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('targetRole', formData.targetRole);
      formDataToSend.append('targetCompany', formData.targetCompany);
      formDataToSend.append('careerLevel', formData.careerLevel);
      
      // 2. Send the data to our API
      const response = await fetch('/api/resumes/feedback', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get resume feedback');
      }
      
      const data = await response.json();
      setFeedback(data.feedback);
      
    } catch (err) {
      console.error('Error getting resume feedback:', err);
      setError('Failed to get resume feedback. Please try again.');
    } finally {
      setLoading(false);
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Get Expert Resume Feedback</h1>
          <p className="text-gray-600">
            Upload your resume and receive personalized feedback to help improve your chances of landing interviews.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {feedback ? (
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-1">Your Resume Feedback</h2>
              <p className="text-gray-500 text-sm">Based on your target role and company</p>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                {feedback.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-600 text-sm">
                  Want more personalized feedback? Share your resume with our community for more insights.
                </p>
                <Link
                  href="/main/resume/upload"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Share Your Resume
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
              <p className="text-gray-600 mb-6">
                Get detailed feedback on your resume's content, format, and effectiveness for your target role.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-8">
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

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Tell us about your target position</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Target Role *
                    </label>
                    <input
                      type="text"
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="E.g., Software Engineer, Product Manager"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Target Company/Industry
                    </label>
                    <input
                      type="text"
                      name="targetCompany"
                      value={formData.targetCompany}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="E.g., Google, Finance Industry"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Career Level *
                  </label>
                  <select
                    name="careerLevel"
                    value={formData.careerLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="intern">Intern</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid-Level (3-5 years)</option>
                    <option value="senior">Senior (6-10 years)</option>
                    <option value="executive">Executive (10+ years)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Analyzing Resume...' : 'Get Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
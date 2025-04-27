'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentTextIcon, PaperClipIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

export default function TextResumeFeedback() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    targetRole: '',
    targetCompany: '',
    careerLevel: 'entry',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'resumeText') {
      setResumeText(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeText || resumeText.trim().length < 100) {
      setError('Please paste your resume text (at least 100 characters)');
      return;
    }
    
    try {
      setLoading(true);
      setFeedback(null);
      
      // Send the data to our API for Claude analysis
      const response = await fetch('/api/resumes/claude-text-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          targetRole: formData.targetRole,
          targetCompany: formData.targetCompany,
          careerLevel: formData.careerLevel,
        }),
      });
      
      if (!response.ok) {
        setError('Failed to get resume feedback. Please try again.');
        return;
      }
      
      // Parse response
      try {
        const data = await response.json();
        setFeedback(data.feedback || 'No feedback received from server');
      } catch (error) {
        console.error('Error parsing response:', error);
        setError('Error parsing server response. Please try again.');
      }
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Get AI-Powered Text Resume Feedback</h1>
          <p className="text-gray-600">
            Paste your resume text and receive personalized feedback from Claude AI to help improve your chances of landing interviews.
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Powered by Anthropic Claude</span>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Text Analysis</span>
          </div>
          <div className="mt-4 flex space-x-4">
            <Link 
              href="/main/resume/feedback"
              className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
            >
              <PaperClipIcon className="h-4 w-4 mr-1" />
              Switch to File Upload
            </Link>
          </div>
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
                {feedback && feedback.includes("unable to extract") && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 font-medium">
                      Note: We couldn't extract text from your PDF. The feedback below is general guidance for your target role.
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      This may happen with scanned PDFs, image-based PDFs, or PDFs with security restrictions.
                    </p>
                  </div>
                )}
                
                {feedback.split('\n').map((paragraph, index) => {
                  // Process markdown-like headings
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{paragraph.replace('# ', '')}</h1>;
                  } else if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold mt-5 mb-3 text-indigo-700">{paragraph.replace('## ', '')}</h2>;
                  } else if (paragraph.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                  } else if (paragraph.startsWith('- ')) {
                    return <li key={index} className="ml-6 mb-2">{paragraph.replace('- ', '')}</li>;
                  } else if (paragraph.trim() === '') {
                    return <div key={index} className="h-2"></div>;
                  } else {
                    return <p key={index} className="mb-4">{paragraph}</p>;
                  }
                })}
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
              <div className="flex flex-col md:flex-row justify-end items-center gap-4">
                <button
                  onClick={() => {
                    setFeedback(null);
                    window.scrollTo(0, 0);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Get New Feedback
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Paste Your Resume Text</h2>
              <p className="text-gray-600 mb-6">
                Copy and paste the text content from your resume document. This allows Claude to analyze your resume directly.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2">
                  Resume Text *
                </label>
                <textarea
                  name="resumeText"
                  value={resumeText}
                  onChange={handleInputChange}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Copy and paste your entire resume text here..."
                  required
                ></textarea>
                <p className="text-sm text-gray-500 mt-1">Min 100 characters for meaningful feedback</p>
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
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Claude is analyzing your resume...
                    </span>
                  ) : 'Get AI Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
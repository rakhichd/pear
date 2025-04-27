"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, StarIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { 
  isLoggedIn,
  getCurrentUserId, 
  getUserDisplayName, 
  getUserEmail,
  getUserCreationDate,
  signOut
} from "@/utils/auth-helpers";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<{[key: string]: string[]}>({
    "UI/UX Resumes": [],
    "SWE Resumes": [],
    "Successful Veterans Resumes": []
  });
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showGroupAssignModal, setShowGroupAssignModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const router = useRouter();

  // Force refresh when component mounts or when coming back to this page
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Check if the user is logged in using our dummy auth
    if (isLoggedIn()) {
      // Create a mock user object using our auth helpers
      const userId = getCurrentUserId();
      setUser({ 
        displayName: getUserDisplayName(),
        email: getUserEmail(),
        uid: userId,
        metadata: { creationTime: getUserCreationDate().toISOString() }
      });
      fetchSavedResumes(userId);
      loadResumeGroups();
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [router, refreshKey]);
  
  // Listen for page visibility changes to refresh data when returning to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefreshKey(prevKey => prevKey + 1);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Load resume groups from localStorage
  const loadResumeGroups = () => {
    try {
      const savedGroups = localStorage.getItem('resumeGroups');
      if (savedGroups) {
        setGroups(JSON.parse(savedGroups));
      } else {
        // Add some fake resumes to groups for demonstration
        const mockGroups = {
          "UI/UX Resumes": ["ui-ux-resume-1", "ui-ux-resume-2"],
          "SWE Resumes": ["swe-resume-1", "swe-resume-2"],
          "Successful Veterans Resumes": []
        };
        setGroups(mockGroups);
        localStorage.setItem('resumeGroups', JSON.stringify(mockGroups));
      }
    } catch (error) {
      console.error('Error loading resume groups:', error);
    }
  };

  // Fetch saved resumes for the authenticated user
  const fetchSavedResumes = async (userId: string) => {
    setIsLoading(true);
    try {
      // Try the API first
      try {
        const response = await fetch(`/api/resumes/saved?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch saved resumes');
        }
        
        const data = await response.json();
        
        // If we have saved resumes from the API, use them
        if (data.savedResumes && data.savedResumes.length > 0) {
          setSavedResumes(data.savedResumes);
        } else {
          // If no saved resumes from API, throw error to use localStorage
          throw new Error('No saved resumes from API');
        }
      } catch (apiError) {
        console.error('API error, falling back to localStorage:', apiError);
        
        // First check if we have any saved resume data in localStorage
        try {
          const savedResumeIds = JSON.parse(localStorage.getItem('savedResumes') || '[]');
          const savedResumesData = JSON.parse(localStorage.getItem('savedResumesData') || '{}');
          
          // If there are user-saved resumes, use those data
          if (savedResumeIds.length > 0) {
            // Force localStorage to have data for all saved resume IDs
            // If a resume ID doesn't have corresponding data, create placeholder data
            savedResumeIds.forEach(id => {
              if (!savedResumesData[id]) {
                savedResumesData[id] = {
                  id,
                  title: `Resume ${id}`,
                  skills: ['HTML', 'CSS', 'JavaScript'],
                  education: 'Not specified',
                  experienceLevel: 'Not specified',
                  companies: ['Not specified']
                };
              }
            });
            
            // Save the updated data
            localStorage.setItem('savedResumesData', JSON.stringify(savedResumesData));
            
            // Create array of resume objects from the IDs and data
            const userSavedResumes = savedResumeIds.map(id => savedResumesData[id]);
            
            // Always set these resumes, even if the array is empty
            setSavedResumes(userSavedResumes);
            console.log('Using saved resumes:', userSavedResumes);
            
            // Exit early since we found user-saved resumes
            setIsLoading(false);
            return;
          }
        } catch (localStorageError) {
          console.error('Error reading from localStorage:', localStorageError);
        }
        
        // If no user-saved resumes found, use demo data
        const mockResumes = [
          {
            id: 'kaggle-16852973',
            title: 'HR Professional Resume',
            skills: ['Recruitment', 'Onboarding', 'Employee Relations', 'HR Management'],
            education: 'Bachelor in HR Management',
            experienceLevel: '5+ years',
            companies: ['IBM', 'Microsoft', 'Google']
          },
          {
            id: 'ui-ux-resume-1',
            title: 'Senior UI/UX Designer with 8 years experience',
            skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
            education: 'BFA in Graphic Design',
            experienceLevel: '8+ years',
            companies: ['Dropbox', 'Airbnb', 'Netflix']
          },
          {
            id: 'ui-ux-resume-2',
            title: 'UX Researcher specializing in mobile apps',
            skills: ['User Testing', 'Analytics', 'Usability Studies', 'Wireframing', 'Mockups'],
            education: 'MS in Human-Computer Interaction',
            experienceLevel: '3+ years',
            companies: ['Facebook', 'Instagram', 'Uber']
          },
          {
            id: 'swe-resume-1',
            title: 'Senior Frontend Engineer with React expertise',
            skills: ['JavaScript', 'React', 'TypeScript', 'Redux', 'Next.js', 'CSS-in-JS'],
            education: 'BS in Computer Science',
            experienceLevel: '6+ years',
            companies: ['Amazon', 'Stripe', 'Shopify']
          },
          {
            id: 'swe-resume-2',
            title: 'Backend Developer with focus on distributed systems',
            skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Kubernetes', 'Docker'],
            education: 'MS in Computer Engineering',
            experienceLevel: '7+ years',
            companies: ['LinkedIn', 'PayPal', 'Oracle']
          }
        ];
        
        // Only use demo data if there are no user-saved resumes
        const savedResumeIds = JSON.parse(localStorage.getItem('savedResumes') || '[]');
        if (savedResumeIds.length === 0) {
          // Store these IDs in localStorage so they persist
          const demoResumeIds = mockResumes.map(resume => resume.id);
          localStorage.setItem('savedResumes', JSON.stringify(demoResumeIds));
          
          // Also store the demo resume data
          const savedResumesData = mockResumes.reduce((acc, resume) => {
            acc[resume.id] = resume;
            return acc;
          }, {});
          localStorage.setItem('savedResumesData', JSON.stringify(savedResumesData));
          
          setSavedResumes(mockResumes);
        } else {
          // If we have IDs but no data, use the mock data for those IDs
          const existingResumesData = JSON.parse(localStorage.getItem('savedResumesData') || '{}');
          
          // For each saved ID, make sure we have data
          savedResumeIds.forEach(id => {
            if (!existingResumesData[id]) {
              // Find a mock resume to use as placeholder if possible
              const mockResume = mockResumes.find(r => r.id === id);
              if (mockResume) {
                existingResumesData[id] = mockResume;
              } else {
                // Otherwise create a generic placeholder
                existingResumesData[id] = {
                  id,
                  title: `Resume ${id}`,
                  skills: ['HTML', 'CSS', 'JavaScript'],
                  education: 'Bachelor\'s Degree',
                  experienceLevel: 'Mid-level',
                  companies: ['Example Corp']
                };
              }
            }
          });
          
          // Update localStorage with the complete data
          localStorage.setItem('savedResumesData', JSON.stringify(existingResumesData));
          
          // Convert to array for the state
          const userResumes = savedResumeIds.map(id => existingResumesData[id]);
          setSavedResumes(userResumes);
        }
      }
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
      // Try the API first
      try {
        const response = await fetch(`/api/resumes/saved?userId=${user.uid}&resumeId=${resumeId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove saved resume');
        }
      } catch (apiError) {
        console.error('API error, falling back to localStorage:', apiError);
      }
      
      // Always update localStorage as fallback
      const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
      localStorage.setItem('savedResumes', JSON.stringify(savedResumes.filter(id => id !== resumeId)));
      
      // Remove resume from all groups
      const updatedGroups = { ...groups };
      Object.keys(updatedGroups).forEach(groupName => {
        updatedGroups[groupName] = updatedGroups[groupName].filter(id => id !== resumeId);
      });
      setGroups(updatedGroups);
      localStorage.setItem('resumeGroups', JSON.stringify(updatedGroups));
      
      // Update the local state to remove the deleted resume
      setSavedResumes(prevSavedResumes => prevSavedResumes.filter(resume => resume.id !== resumeId));
    } catch (err) {
      console.error('Error removing saved resume:', err);
      setError('Failed to remove resume from saved list. Please try again.');
    }
  };
  
  // Create a new group
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const updatedGroups = {
      ...groups,
      [newGroupName]: []
    };
    
    setGroups(updatedGroups);
    localStorage.setItem('resumeGroups', JSON.stringify(updatedGroups));
    setNewGroupName('');
    setShowNewGroupModal(false);
  };
  
  // Delete a group
  const handleDeleteGroup = (groupName: string) => {
    const updatedGroups = { ...groups };
    delete updatedGroups[groupName];
    
    setGroups(updatedGroups);
    localStorage.setItem('resumeGroups', JSON.stringify(updatedGroups));
  };
  
  // Add resume to group
  const handleAddToGroup = (groupName: string) => {
    if (!selectedResumeId) return;
    
    const updatedGroups = { ...groups };
    if (!updatedGroups[groupName].includes(selectedResumeId)) {
      updatedGroups[groupName] = [...updatedGroups[groupName], selectedResumeId];
    }
    
    setGroups(updatedGroups);
    localStorage.setItem('resumeGroups', JSON.stringify(updatedGroups));
    setShowGroupAssignModal(false);
    setSelectedResumeId(null);
  };
  
  // Remove resume from group
  const handleRemoveFromGroup = (groupName: string, resumeId: string) => {
    const updatedGroups = { ...groups };
    updatedGroups[groupName] = updatedGroups[groupName].filter(id => id !== resumeId);
    
    setGroups(updatedGroups);
    localStorage.setItem('resumeGroups', JSON.stringify(updatedGroups));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Fun wavy background header with gradient */}
        <div className="relative overflow-hidden rounded-2xl mb-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="white" fillOpacity="1" d="M0,192L48,208C96,224,192,256,288,240C384,224,480,160,576,144C672,128,768,160,864,176C960,192,1056,192,1152,170.7C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          
          <div className="relative px-8 py-10 md:py-16 flex flex-col md:flex-row items-center justify-between z-10">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Your Creative Collection</h1>
              <p className="text-indigo-100 max-w-md">Organize your saved resumes into inspirational groups and discover new ideas.</p>
            </div>
            
            <div className="flex space-x-4">
              <Link 
                href="/main/search" 
                className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Find More Resumes
              </Link>
              <button
                onClick={() => setShowNewGroupModal(true)}
                className="flex items-center px-4 py-2 bg-white text-indigo-600 rounded-full hover:bg-opacity-90 transition shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Group
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm animate-pulse">
            {error}
          </div>
        )}
        
        {/* Create New Group Modal */}
        {showNewGroupModal && (
          <div className="fixed inset-0 z-50 overflow-auto backdrop-blur-sm bg-black/40 flex items-center justify-center animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-0 w-full max-w-md mx-4 overflow-hidden animate-scaleIn">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Create New Collection</h3>
                  <button
                    onClick={() => setShowNewGroupModal(false)}
                    className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-indigo-100 text-sm mt-1">Organize your saved resumes into meaningful collections</p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., UI/UX Resumes, Tech Lead Resumes"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">Choose a name that describes the type of resumes you're grouping</p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNewGroupModal(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    className={`px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full transition font-medium 
                      ${!newGroupName.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-0.5 hover:shadow-indigo-200'}`}
                    disabled={!newGroupName.trim()}
                  >
                    Create Collection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Add to Group Modal */}
        {showGroupAssignModal && (
          <div className="fixed inset-0 z-50 overflow-auto backdrop-blur-sm bg-black/40 flex items-center justify-center animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-0 w-full max-w-md mx-4 overflow-hidden animate-scaleIn">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Add to Collection</h3>
                  <button
                    onClick={() => setShowGroupAssignModal(false)}
                    className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-pink-100 text-sm mt-1">Choose a collection for this resume</p>
              </div>
              
              <div className="p-6">
                {Object.keys(groups).length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-2">
                    {Object.entries(groups).map(([groupName, resumeIds]) => {
                      const isInGroup = resumeIds.includes(selectedResumeId || '');
                      return (
                        <div key={groupName} className="relative">
                          <button
                            onClick={() => handleAddToGroup(groupName)}
                            className={`w-full text-left p-3 rounded-xl transition flex items-center ${
                              isInGroup 
                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100' 
                                : 'border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <span className={`h-4 w-4 rounded-full ${isInGroup ? 'bg-indigo-500' : 'bg-gray-200'} mr-3 flex-shrink-0`}>
                                  {isInGroup && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </span>
                                <span className={`font-medium ${isInGroup ? 'text-indigo-700' : 'text-gray-800'}`}>{groupName}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {resumeIds.length} {resumeIds.length === 1 ? 'resume' : 'resumes'}
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-600 mb-2">No collections available</p>
                    <p className="text-gray-500 text-sm">Create your first collection to organize your resumes</p>
                  </div>
                )}
                
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowNewGroupModal(true);
                      setShowGroupAssignModal(false);
                    }}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create New Collection
                  </button>
                  <button
                    onClick={() => setShowGroupAssignModal(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* User Profile Card */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-md overflow-hidden p-1">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-6 md:w-1/3 flex flex-col items-center justify-center text-white">
                    <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg ring-4 ring-white/30">
                      <UserCircleIcon className="h-16 w-16 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">{user?.displayName || getUserDisplayName()}</h2>
                    <p className="text-indigo-100 text-sm">{user?.email || getUserEmail()}</p>
                    <p className="text-indigo-200 text-xs mt-1">Member since {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                  </div>
                  
                  <div className="p-6 md:w-2/3 flex flex-col justify-center">
                    <h3 className="font-semibold text-gray-700 mb-4">Your Collection Stats</h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-indigo-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-indigo-600">{savedResumes.length}</p>
                        <p className="text-xs text-gray-600">Saved Resumes</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">{Object.keys(groups).length}</p>
                        <p className="text-xs text-gray-600">Collections</p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-pink-600">{Object.values(groups).reduce((sum, ids) => sum + ids.length, 0)}</p>
                        <p className="text-xs text-gray-600">Categorized</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link 
                        href="/main/search"
                        className="flex items-center text-sm px-4 py-2 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search Resumes
                      </Link>
                      <Link 
                        href="/main/profile/edit"
                        className="flex items-center text-sm px-4 py-2 text-purple-600 border border-purple-200 rounded-full hover:bg-purple-50 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          router.push("/auth/login");
                        }}
                        className="flex items-center text-sm px-4 py-2 text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Resume Groups Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">Resume Collections</h2>
                  <p className="text-gray-600 text-sm">Organize your saved resumes into meaningful collections</p>
                </div>
                <button 
                  onClick={() => setShowNewGroupModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:opacity-90 transition shadow-md flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Collection
                </button>
              </div>
              
              {Object.keys(groups).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(groups).map(([groupName, resumeIds]) => (
                    <div key={groupName} className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 h-full flex flex-col transform transition duration-300 hover:scale-[1.02] hover:shadow-xl">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center relative overflow-hidden bg-gradient-to-r from-indigo-50 to-indigo-100">
                        {/* Background pattern decoration */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                          <svg width="100%" height="100%" className="text-indigo-900">
                            <pattern id={`pattern-${groupName.replace(/\s+/g, '-')}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                              <path d="M-3,3 l6,-6 M0,10 l10,-10 M7,13 l6,-6" strokeWidth="1" stroke="currentColor" fill="none" />
                            </pattern>
                            <rect x="0" y="0" width="100%" height="100%" fill={`url(#pattern-${groupName.replace(/\s+/g, '-')})`} />
                          </svg>
                        </div>
                        
                        <div className="relative">
                          <h3 className="text-lg font-bold text-indigo-800">{groupName}</h3>
                          <p className="text-xs text-indigo-600 mt-1">{resumeIds.length} {resumeIds.length === 1 ? 'resume' : 'resumes'}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteGroup(groupName)}
                          className="relative text-indigo-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                          title="Delete collection"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="p-4 flex-grow">
                        {resumeIds.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {resumeIds.map(resumeId => {
                              const resume = savedResumes.find(r => r.id === resumeId);
                              
                              if (!resume) return null;
                              
                              return (
                                <div key={resumeId} className="border border-gray-100 rounded-xl p-3 bg-gradient-to-br from-white to-gray-50 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition duration-300">
                                  <div className="text-sm font-medium text-indigo-700 mb-2 line-clamp-2">
                                    {resume.title || "Untitled Resume"}
                                  </div>
                                  {resume.skills && resume.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {resume.skills.slice(0, 2).map((skill: string, idx: number) => (
                                        <span key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full">
                                          {skill}
                                        </span>
                                      ))}
                                      {resume.skills.length > 2 && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full">
                                          +{resume.skills.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                    <Link
                                      href={`/main/resume/${resumeId}`}
                                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                                    >
                                      View Resume
                                    </Link>
                                    <button 
                                      onClick={() => handleRemoveFromGroup(groupName, resumeId)}
                                      className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                                      title="Remove from collection"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8 px-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mb-2">No resumes in this collection yet.</p>
                            <p className="text-xs text-indigo-600">Add resumes from your saved list below.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl shadow-md text-center border border-indigo-50">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-gray-800">Start Organizing Your Resumes</h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Create collections to organize your saved resumes by category, skills, or whatever works for you.</p>
                  <button
                    onClick={() => setShowNewGroupModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:opacity-90 transition transform hover:-translate-y-0.5"
                  >
                    Create Your First Collection
                  </button>
                </div>
              )}
            </div>
            
            {/* Saved Resumes Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Saved Resumes</h2>
                  <p className="text-gray-600 text-sm">All your bookmarked resumes ready to explore</p>
                </div>
                <Link
                  href="/main/search"
                  className="flex items-center px-4 py-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find More
                </Link>
              </div>
              
              {savedResumes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {savedResumes.map(resume => (
                    <div key={resume.id} className="group bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl flex flex-col transform transition duration-300 hover:scale-[1.02]">
                      <div className="p-4 flex-grow flex flex-col relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-50 to-purple-50 rounded-bl-3xl -mr-10 -mt-10 transform rotate-12 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start mb-2 relative">
                          <h2 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition-colors duration-300">
                            {resume.title || "Untitled Resume"}
                          </h2>
                          <div className="flex space-x-0.5">
                            <button 
                              onClick={() => {
                                setSelectedResumeId(resume.id);
                                setShowGroupAssignModal(true);
                              }}
                              className="text-gray-400 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                              title="Add to collection"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleRemove(resume.id)}
                              className="text-yellow-500 hover:text-yellow-600 p-1 rounded-full hover:bg-yellow-50 transition-colors"
                              title="Remove from saved"
                            >
                              <StarIconSolid className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex-grow overflow-hidden flex flex-col relative">
                          {/* Skills */}
                          {resume.skills && resume.skills.length > 0 && (
                            <div className="mb-2">
                              <div className="flex flex-wrap gap-1">
                                {resume.skills.slice(0, 3).map((skill: string) => (
                                  <span key={skill} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full">
                                    {skill}
                                  </span>
                                ))}
                                {resume.skills.length > 3 && (
                                  <span className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full">
                                    +{resume.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Groups/Collections */}
                          {Object.entries(groups).some(([_, ids]) => ids.includes(resume.id)) && (
                            <div className="mb-2">
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(groups)
                                  .filter(([_, ids]) => ids.includes(resume.id))
                                  .slice(0, 2)
                                  .map(([groupName]) => (
                                    <span key={groupName} className="text-xs bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded-full">
                                      {groupName}
                                    </span>
                                  ))
                                }
                                {Object.entries(groups).filter(([_, ids]) => ids.includes(resume.id)).length > 2 && (
                                  <span className="text-xs bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded-full">
                                    +{Object.entries(groups).filter(([_, ids]) => ids.includes(resume.id)).length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Experience */}
                          {resume.experienceLevel && (
                            <div className="text-xs text-gray-500 mb-2">
                              <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {resume.experienceLevel}
                              </span>
                            </div>
                          )}
                          
                          {/* Education */}
                          {resume.education && (
                            <div className="text-xs text-gray-500 mb-2 truncate">
                              <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                </svg>
                                {resume.education}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* View button */}
                        <Link
                          href={`/main/resume/${resume.id}`}
                          className="w-full mt-auto block text-center px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm hover:from-indigo-700 hover:to-purple-700 transition transform group-hover:scale-[1.02] shadow-sm"
                        >
                          View Resume
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl shadow-md text-center border border-pink-50">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-pink-100 rounded-full opacity-50 animate-ping"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <StarIcon className="h-12 w-12 text-pink-500" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-gray-800">Your Collection Is Empty</h2>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Discover and save resumes that inspire you to build your perfect collection.</p>
                  <Link
                    href="/main/search"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-full hover:shadow-lg hover:opacity-90 transition"
                  >
                    Explore Resumes
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
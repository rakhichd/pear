"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { 
  isLoggedIn,
  getCurrentUserId, 
  getUserDisplayName, 
  getUserEmail,
  getUserCreationDate,
  updateUserProfile
} from "@/utils/auth-helpers";

type ProfileFormValues = {
  displayName: string;
  email: string;
};

export default function EditProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    displayName: '',
    email: '',
  });
  const router = useRouter();
  
  useEffect(() => {
    // Check if the user is logged in
    if (isLoggedIn()) {
      // Create a user object using our auth helpers
      const userId = getCurrentUserId();
      const displayName = getUserDisplayName();
      const email = getUserEmail();
      
      setUser({ 
        displayName,
        email,
        uid: userId,
        metadata: { creationTime: getUserCreationDate().toISOString() }
      });
      
      setFormValues({
        displayName,
        email,
      });
      
      setIsLoading(false);
    } else {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!formValues.displayName.trim()) {
        throw new Error('Name cannot be empty');
      }
      
      if (!formValues.email.trim() || !/\S+@\S+\.\S+/.test(formValues.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Update profile using the helper function
      const success = await updateUserProfile({
        displayName: formValues.displayName,
        email: formValues.email
      });
      
      if (!success) {
        throw new Error('Failed to update profile. Please try again.');
      }
      
      // Show success message
      setSuccess('Your profile has been updated successfully!');
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        displayName: formValues.displayName,
        email: formValues.email
      }));
      
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/main/profile" 
            className="mr-4 p-2 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-50 transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            {success}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile picture section */}
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-4 shadow-lg">
                    <UserCircleIcon className="h-24 w-24 text-white" />
                  </div>
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Member since {new Date(user?.metadata?.creationTime || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Form section */}
                <div className="md:w-2/3">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Display Name field */}
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        id="displayName"
                        name="displayName"
                        type="text"
                        value={formValues.displayName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    {/* Email field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formValues.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <Link
                        href="/main/profile"
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
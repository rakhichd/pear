"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { isLoggedIn, getUserDisplayName, signOut } from "@/utils/auth-helpers";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on component mount and when localStorage changes
  useEffect(() => {
    // Function to check auth status
    const checkAuthStatus = () => {
      setIsAuthenticated(isLoggedIn());
      setLoading(false);
    };

    // Check auth status initially
    checkAuthStatus();

    // Listen for storage events (in case another tab logs in/out)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSignOut = () => {
    signOut();
    setIsAuthenticated(false);
    
    // Redirect to home or login page
    window.location.href = '/auth/login';
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          ResumeFind
        </Link>
        
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        ) : (
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <Link href="/main/search" className="text-gray-600 hover:text-gray-900">
                  Search
                </Link>
                <Link href="/main/profile" className="text-gray-600 hover:text-gray-900">
                  Collections
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
                <Link 
                  href="/main/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="hidden md:inline">{getUserDisplayName()}</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/main/search" className="text-gray-600 hover:text-gray-900">
                  Search
                </Link>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                  Log in
                </Link>
                <Link 
                  href="/auth/signup"
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
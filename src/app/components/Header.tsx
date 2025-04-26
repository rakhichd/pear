"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { getCurrentUserId, getUserDisplayName } from "@/utils/auth-helpers";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      // Clear local storage first
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userEmail');
      }
      
      // Then sign out from Firebase
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
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
            {user ? (
              <>
                <Link href="/main/search" className="text-gray-600 hover:text-gray-900">
                  Search
                </Link>
                <Link href="/main/saved" className="text-gray-600 hover:text-gray-900">
                  Saved
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
                <Link 
                  href="/main/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  Profile
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
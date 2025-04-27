'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  ArrowUpTrayIcon, 
  DocumentTextIcon, 
  HomeIcon,
  UserIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { isLoggedIn, getUserDisplayName, signOut } from "@/utils/auth-helpers";

export default function SideNav() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(isLoggedIn());
      setLoading(false);
    };

    checkAuth();

    // Listen for storage events (in case another tab logs in/out)
    const handleStorageChange = () => {
      checkAuth();
    };

    // Set default expanded state based on screen size
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setExpanded(window.innerWidth >= 1024); // lg breakpoint
      }
    };
    
    // Initialize expanded state
    handleResize();
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setExpanded(prev => !prev);
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut();
    setIsAuthenticated(false);
    
    // Redirect to home or login page
    window.location.href = '/auth/login';
  };

  // Navigation items
  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <HomeIcon className="h-5 w-5" />
    },
    {
      name: "Search",
      href: "/main/search",
      icon: <MagnifyingGlassIcon className="h-5 w-5" />
    },
    {
      name: "Upload Resume",
      href: "/main/resume/upload",
      icon: <ArrowUpTrayIcon className="h-5 w-5" />
    },
    {
      name: "PDF Feedback",
      href: "/main/resume/feedback",
      icon: <DocumentTextIcon className="h-5 w-5" />
    },
    {
      name: "Text Feedback",
      href: "/main/resume/text-feedback",
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    }
  ];

  // Account navigation items
  const accountItems = isAuthenticated 
    ? [
        {
          name: "Profile",
          href: "/main/profile",
          icon: <UserIcon className="h-5 w-5" />
        },
        {
          name: "Sign Out",
          action: handleSignOut,
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        }
      ]
    : [
        {
          name: "Log In",
          href: "/auth/login",
          icon: <UserIcon className="h-5 w-5" />
        },
        {
          name: "Sign Up",
          href: "/auth/signup",
          icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        }
      ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-indigo-50 shadow-md"
        aria-label={expanded ? "Close navigation" : "Open navigation"}
      >
        {expanded ? (
          <XMarkIcon className="h-6 w-6 text-indigo-600" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-indigo-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-40 
          ${expanded ? 'w-64' : 'w-16'} border-r border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className={`p-4 flex ${expanded ? 'justify-between' : 'justify-center'} items-center border-b border-gray-100`}>
            {expanded && (
              <Link href="/" className="font-bold text-indigo-600">
                ResumeFind
              </Link>
            )}
            <button 
              onClick={toggleSidebar} 
              className="p-1.5 rounded-md hover:bg-gray-100"
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {expanded ? (
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow overflow-y-auto py-4">
            <div className="px-3 space-y-1">
              {/* Main Navigation */}
              {expanded && (
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 px-3">
                  Navigation
                </h3>
              )}
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                    pathname === item.href 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                  title={!expanded ? item.name : ""}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {expanded && <span className="font-medium">{item.name}</span>}
                </Link>
              ))}
            </div>

            {/* Account Section */}
            <div className="mt-8 px-3 space-y-1">
              {expanded && (
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 px-3">
                  Account
                </h3>
              )}
              {accountItems.map((item, index) => 
                item.href ? (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                      pathname === item.href 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                    title={!expanded ? item.name : ""}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {expanded && <span className="font-medium">{item.name}</span>}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={item.action}
                    className="flex w-full items-center gap-3 p-3 rounded-md transition-colors text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    title={!expanded ? item.name : ""}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {expanded && <span className="font-medium">{item.name}</span>}
                  </button>
                )
              )}
            </div>
          </nav>

          {/* User Info */}
          {isAuthenticated && expanded && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-full p-1">
                  <UserIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">Logged in</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
      
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-30 lg:hidden transition-opacity duration-300 ${
          expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setExpanded(false)}
      />
    </>
  );
}
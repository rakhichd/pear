'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, SparklesIcon, LightBulbIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const particlesRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Rotating headlines
  const headlines = [
    "Find the perfect resume examples that worked",
    "Discover resumes that landed dream jobs",
    "Explore winning resume templates",
    "Elevate your career with proven resumes",
    "See how successful candidates present themselves"
  ];

  // Change headline every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentHeadlineIndex((prevIndex) => (prevIndex + 1) % headlines.length);
        setIsAnimating(false);
      }, 500); // Wait for fade-out animation before changing text
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Create floating particles effect
  useEffect(() => {
    setShowParticles(true);
    
    // Particle animation
    const animateParticles = () => {
      if (!particlesRef.current) return;
      
      const particles = particlesRef.current.children;
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i] as HTMLElement;
        const top = parseFloat(particle.style.top || "0");
        const left = parseFloat(particle.style.left || "0");
        
        // Move particles upward and slightly to the sides
        particle.style.top = `${top - 0.2}px`;
        particle.style.left = `${left + (Math.random() - 0.5) * 0.5}px`;
        
        // Reset particles that move off-screen
        if (top < -20) {
          particle.style.top = "100%";
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.opacity = `${Math.random() * 0.5 + 0.1}`;
        }
      }
      
      requestAnimationFrame(animateParticles);
    };
    
    const frameId = requestAnimationFrame(animateParticles);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Redirect to the search page with the query
      router.push(`/simple-search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle key press for search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">

      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="flex justify-center items-center mb-16">
          <h1 className="text-3xl font-bold text-indigo-600 animate-pulse-slow">ResumeFind</h1>
        </header>

        {/* Animated Particles Background */}
        <div 
          ref={particlesRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ opacity: showParticles ? 1 : 0, transition: 'opacity 1s ease-in' }}
        >
          {Array.from({ length: 40 }).map((_, index) => (
            <div 
              key={index}
              className="absolute rounded-full"
              style={{
                backgroundColor: index % 3 === 0 ? '#c7d2fe' : index % 3 === 1 ? '#e0e7ff' : '#dbeafe',
                width: `${Math.random() * 15 + 3}px`,
                height: `${Math.random() * 15 + 3}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
          <div className="relative overflow-hidden h-24 md:h-36 mb-6">
            <h2 
              className={`text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
            >
              {headlines[currentHeadlineIndex]}
            </h2>
          </div>

          <div className="flex items-center justify-center mb-8 animate-bounce-slow">
            <p className="text-xl text-gray-600 relative">
              Search winning resume examples from people like you who landed offers at top companies
              <SparklesIcon className="absolute -right-8 -top-2 h-6 w-6 text-yellow-400 animate-pulse" />
            </p>
          </div>
          
          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden bg-white shadow-md hover:shadow-xl transition">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-4" />
              <input 
                type="text"
                placeholder="Search by role, skills, company, background..."
                className="flex-1 px-4 py-3 focus:outline-none text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="bg-indigo-600 text-white px-6 py-3 font-medium hover:bg-indigo-700 transition relative overflow-hidden group"
                onClick={handleSearch}
              >
                <span className="relative z-10">Search</span>
                <span className="absolute inset-0 bg-indigo-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </button>
            </div>
          </div>

          {/* Example Tags */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { label: "Software Engineer", icon: <RocketLaunchIcon className="h-3 w-3 mr-1" /> },
              { label: "Product Manager", icon: <LightBulbIcon className="h-3 w-3 mr-1" /> },
              { label: "Data Scientist", icon: <SparklesIcon className="h-3 w-3 mr-1" /> },
              { label: "UI/UX Designer", icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg> }
            ].map((item, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 rounded-full text-sm hover:from-indigo-100 hover:to-blue-100 cursor-pointer transition-all duration-300 flex items-center shadow-sm hover:shadow transform hover:-translate-y-0.5"
                onClick={() => {
                  setSearchQuery(item.label);
                  handleSearch();
                }}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.icon}
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>,
              title: "Search by Background",
              description: "Find resumes from people with similar education and experience as you.",
              color: "from-indigo-50 to-blue-50",
              iconBg: "bg-indigo-100",
              hoverColor: "from-indigo-100 to-blue-100"
            },
            {
              icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>,
              title: "Verified Success",
              description: "Every resume example includes the offers or interviews they received.",
              color: "from-purple-50 to-indigo-50",
              iconBg: "bg-purple-100",
              hoverColor: "from-purple-100 to-indigo-100"
            },
            {
              icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>,
              title: "Targeted Results",
              description: "Filter by skills, companies, roles, and experience level.",
              color: "from-blue-50 to-indigo-50",
              iconBg: "bg-blue-100",
              hoverColor: "from-blue-100 to-indigo-100"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-br ${feature.color} p-6 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-br ${feature.hoverColor}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`w-12 h-12 ${feature.iconBg} rounded-full flex items-center justify-center mb-4 transform transition-transform duration-300 hover:rotate-12`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      
        
        {/* CTA Section - Resume Upload & Feedback */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 mb-16 text-center relative overflow-hidden shadow-xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-1/2 right-10 w-20 h-20 bg-white opacity-5 rounded-full transform -translate-y-1/2"></div>
          </div>
          
          {/* Animated stars */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div 
              key={index}
              className="absolute animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${index * 0.5}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <SparklesIcon className="h-4 w-4 text-white opacity-70" />
            </div>
          ))}
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4 animate-fadeIn">Share Your Success Story</h3>
            <p className="mb-8 max-w-2xl mx-auto animate-fadeIn text-white/90">
              Help others succeed by sharing your winning resume. Upload your resume that landed you interviews or job offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {[
                { 
                  href: "/main/resume/upload",
                  label: "Upload Your Resume",
                  className: "bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105 hover:shadow-lg"
                },
                { 
                  href: "/main/resume/feedback",
                  label: "Get Resume Feedback", 
                  className: "bg-indigo-800 text-white hover:bg-indigo-900 hover:scale-105 hover:shadow-lg border border-indigo-700"
                },
                { 
                  href: "/main/resume/text-feedback",
                  label: "Text-Based Feedback",
                  className: "bg-indigo-900 text-white hover:bg-indigo-950 hover:scale-105 hover:shadow-lg border border-indigo-800"
                }
              ].map((button, index) => (
                <Link 
                  key={index}
                  href={button.href}
                  className={`inline-block px-6 py-3 rounded-lg font-medium transition-all duration-300 transform ${button.className}`}
                  style={{ 
                    animationDelay: `${index * 0.2}s`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {button.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">© 2024 ResumeFind. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

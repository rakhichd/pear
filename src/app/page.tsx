import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold text-indigo-600">ResumeFind</h1>
          <div className="flex gap-4">
            <Link 
              href="/auth/login"
              className="px-4 py-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
            >
              Log in
            </Link>
            <Link 
              href="/auth/signup"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Sign up
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
            Find the perfect resume examples that worked
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Search winning resume examples from people like you who landed offers at top companies
          </p>
          
          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden bg-white shadow-sm hover:shadow-md transition">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-4" />
              <input 
                type="text"
                placeholder="Search by role, skills, company, background..."
                className="flex-1 px-4 py-3 focus:outline-none text-gray-800"
              />
              <button className="bg-indigo-600 text-white px-6 py-3 font-medium hover:bg-indigo-700 transition">
                Search
              </button>
            </div>
          </div>

          {/* Example Tags */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 cursor-pointer">Software Engineer</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 cursor-pointer">Product Manager</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 cursor-pointer">Data Scientist</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 cursor-pointer">UI/UX Designer</span>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Search by Background</h3>
            <p className="text-gray-600">Find resumes from people with similar education and experience as you.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Success</h3>
            <p className="text-gray-600">Every resume example includes the offers or interviews they received.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Targeted Results</h3>
            <p className="text-gray-600">Filter by skills, companies, roles, and experience level.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-600 text-white rounded-2xl p-8 mb-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to improve your resume?</h3>
          <p className="mb-6 max-w-2xl mx-auto">Join thousands of job seekers who found inspiration from successful resumes and landed their dream jobs.</p>
          <Link 
            href="/auth/signup" 
            className="inline-block px-6 py-3 bg-white text-indigo-600 rounded-md font-medium hover:bg-gray-100 transition"
          >
            Get Started For Free
          </Link>
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

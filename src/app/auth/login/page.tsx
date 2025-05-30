"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { isLoggedIn } from '@/utils/auth-helpers';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Check if user is already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      // Redirect to profile page if already logged in
      router.push('/main/profile');
    }
  }, [router]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate loading time to make it feel realistic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user information in localStorage for demo purposes
      if (typeof window !== 'undefined') {
        localStorage.setItem('dummyAuth', 'true');
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userName', data.email.split('@')[0]);
        localStorage.setItem('userId', 'demo-user-' + Math.floor(Math.random() * 1000));
        localStorage.setItem('userCreated', new Date().toISOString());
      }
      
      console.log('Successfully logged in with dummy account');
      
      // Check if there was a resume the user wanted to save before logging in
      const resumeToSave = localStorage.getItem('resumeToSaveAfterLogin');
      if (resumeToSave) {
        localStorage.removeItem('resumeToSaveAfterLogin');
        router.push(`/resume/${resumeToSave}`);
      } else {
        // Manually redirect to profile page
        router.push('/main/profile');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('An error occurred. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-8">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to home
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">
              Log in to access your saved resumes and searches
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Error message display */}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
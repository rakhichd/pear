import { auth } from '@/lib/firebase';

/**
 * Get the current user ID, or a fallback ID if not authenticated
 * @returns {string} The user ID or a fallback ID
 */
export function getCurrentUserId(): string {
  const currentUser = auth.currentUser;
  
  // Return the real user ID if authenticated
  if (currentUser) {
    return currentUser.uid;
  }
  
  // Otherwise return a consistent fallback ID for demo purposes
  return "demo-user-123";
}

/**
 * Get the current user's display name or a fallback
 * @returns {string} The user's display name or fallback
 */
export function getUserDisplayName(): string {
  const currentUser = auth.currentUser;
  
  if (currentUser?.displayName) {
    return currentUser.displayName;
  }
  
  // Try to get from localStorage if set during login
  if (typeof window !== 'undefined') {
    const email = localStorage.getItem('userEmail');
    if (email) {
      return email.split('@')[0]; // Use part before @ as name
    }
  }
  
  return "Demo User";
}

/**
 * Get the current user's email or a fallback
 * @returns {string} The user's email or fallback
 */
export function getUserEmail(): string {
  const currentUser = auth.currentUser;
  
  if (currentUser?.email) {
    return currentUser.email;
  }
  
  // Try to get from localStorage if set during login
  if (typeof window !== 'undefined') {
    const email = localStorage.getItem('userEmail');
    if (email) {
      return email;
    }
  }
  
  return "demo@example.com";
}
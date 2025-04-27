/**
 * Check if a user is logged in (or has dummy auth)
 * @returns {boolean} Whether a user is logged in
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const isAuthed = localStorage.getItem('dummyAuth') === 'true';
  console.log('Auth check - isLoggedIn():', isAuthed);
  return isAuthed;
}

/**
 * Get the current user ID, or a fallback ID
 * @returns {string} The user ID or a fallback ID
 */
export function getCurrentUserId(): string {
  if (typeof window === 'undefined') {
    return "demo-user-123";
  }
  
  // Get userId from localStorage if available
  const userId = localStorage.getItem('userId');
  if (userId) {
    return userId;
  }
  
  // Return a default ID otherwise
  return "demo-user-123";
}

/**
 * Get the current user's display name or a fallback
 * @returns {string} The user's display name or fallback
 */
export function getUserDisplayName(): string {
  if (typeof window === 'undefined') {
    return "Demo User";
  }
  
  // Try to get from localStorage if set during login
  const userName = localStorage.getItem('userName');
  if (userName) {
    return userName;
  }
  
  const email = localStorage.getItem('userEmail');
  if (email) {
    return email.split('@')[0]; // Use part before @ as name
  }
  
  return "Demo User";
}

/**
 * Get the current user's email or a fallback
 * @returns {string} The user's email or fallback
 */
export function getUserEmail(): string {
  if (typeof window === 'undefined') {
    return "demo@example.com";
  }
  
  // Try to get from localStorage if set during login
  const email = localStorage.getItem('userEmail');
  if (email) {
    return email;
  }
  
  return "demo@example.com";
}

/**
 * Get the user's account creation date
 * @returns {Date} The user's creation date
 */
export function getUserCreationDate(): Date {
  if (typeof window === 'undefined') {
    return new Date();
  }
  
  const creationDate = localStorage.getItem('userCreated');
  if (creationDate) {
    return new Date(creationDate);
  }
  
  return new Date();
}

/**
 * Sign out the current user
 */
export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('dummyAuth');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userCreated');
  }
}

/**
 * Update user profile information
 * @param {object} profileData - The updated profile data
 * @param {string} profileData.displayName - The updated display name
 * @param {string} profileData.email - The updated email
 * @returns {Promise<boolean>} Whether the update was successful
 */
export async function updateUserProfile(profileData: { displayName: string, email: string }): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update localStorage with the new values
    localStorage.setItem('userEmail', profileData.email);
    localStorage.setItem('userName', profileData.displayName);
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}
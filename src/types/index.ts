export type ResumeData = {
  id: string;
  title: string;
  author: string;
  lastUpdated: string;
  education: string;
  yearsExperience: string;
  skills: string[];
  offers: string[];
  interviews: string[];
  content: string;
  blurPreview?: boolean;
  createdAt: number;
  updatedAt: number;
  userId?: string;
  isPublic: boolean;
  role: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  companies: string[];
  educationLevel: 'high-school' | 'associate' | 'bachelor' | 'master' | 'phd';
  formattingStyle?: 'professional' | 'creative' | 'minimalist';
  pdfUrl?: string;
  pdfFilename?: string;
};

export type UserData = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  savedResumes: string[];
  subscription: 'free' | 'premium' | 'pro';
  createdAt: number;
  lastLoginAt: number;
};

export type SearchFilter = {
  role?: string;
  skills?: string[];
  education?: string;
  experienceLevel?: string;
  companies?: string[];
  query?: string;
}; 
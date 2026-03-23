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
  /** Job / dataset category (folder under public/pdfs/resumes) */
  category?: string;
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
  educationLevel?: string;
  experienceLevel?: string;
  companies?: string[];
  query?: string;
};

/** API search hit (Firestore doc + optional Pinecone fields) */
export type SearchResultItem = Partial<ResumeData> & {
  id: string;
  score?: number;
  highlights?: string[];
  /** Extra fields sometimes returned from Pinecone / legacy APIs */
  experience?: string;
  category?: string;
  source?: string;
  metadata?: { title?: string; content?: string; category?: string };
};

/** Resume detail view (API may omit some ResumeData fields) */
export type ResumeDetail = Partial<ResumeData> & {
  category?: string;
  source?: string;
}; 
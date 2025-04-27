import { Resume } from '@/types/resume';

/**
 * Generate the public URL for a resume PDF
 * @param resumeId The ID of the resume
 * @param category The category of the resume (optional)
 * @returns The public URL for the resume PDF
 */
export function getResumePdfUrl(resumeId: string, category?: string): string {
  // Handle Winston's resume as a special case
  if (resumeId === 'winston') {
    return '/pdfs/resumes/PERSONAL/Winston_s_Resume (9).pdf';
  }
  
  // If we have a category, we can directly construct the path
  if (category) {
    return `/pdfs/resumes/${category}/${resumeId}.pdf`;
  }
  
  // If we don't have a category, we need to guess it
  // Note: In production, we should store the category with the resume data
  return `/pdfs/resumes/${resumeId}.pdf`;
}

/**
 * Update resume data with PDF URLs
 * @param resumes Array of resume objects
 * @returns The same array with pdfUrl properties added
 */
export function addPdfUrlsToResumes(resumes: Resume[]): Resume[] {
  return resumes.map(resume => {
    // Extract category from the id if available (format: CATEGORY/ID)
    let category: string | undefined;
    let pureId = resume.id;
    
    if (resume.category) {
      category = resume.category;
    } else if (resume.id && resume.id.includes('/')) {
      const parts = resume.id.split('/');
      category = parts[0];
      pureId = parts[1];
    }
    
    return {
      ...resume,
      pdfUrl: getResumePdfUrl(pureId, category)
    };
  });
} 
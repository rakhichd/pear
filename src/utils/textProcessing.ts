/**
 * Utilities for processing resume text for embedding and search
 */

/**
 * Extracts and prepares full text from a resume object for embedding
 * @param resumeData Resume data object containing various fields
 * @returns Processed text suitable for embedding
 */
export function prepareResumeTextForEmbedding(resumeData: Record<string, unknown>): string {
  if (!resumeData) return '';
  
  const parts: string[] = [];
  
  // Add main resume parts
  if (resumeData.title) parts.push(`Title: ${resumeData.title}`);
  if (resumeData.summary) parts.push(`Summary: ${resumeData.summary}`);
  
  // Add skills
  if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    parts.push(`Skills: ${(resumeData.skills as string[]).join(', ')}`);
  }
  
  // Add education
  if (resumeData.education) {
    if (typeof resumeData.education === 'string') {
      parts.push(`Education: ${resumeData.education}`);
    } else if (Array.isArray(resumeData.education)) {
      const educationTexts = (resumeData.education as Record<string, unknown>[]).map((edu) => {
        const eduParts: string[] = [];
        if (edu.degree) eduParts.push(String(edu.degree));
        if (edu.institution) eduParts.push(String(edu.institution));
        if (edu.year) eduParts.push(String(edu.year));
        return eduParts.join(', ');
      });
      parts.push(`Education: ${educationTexts.join('; ')}`);
    }
  }
  
  // Add work experience
  if (resumeData.experience) {
    if (typeof resumeData.experience === 'string') {
      parts.push(`Experience: ${resumeData.experience}`);
    } else if (Array.isArray(resumeData.experience)) {
      const experienceTexts = (resumeData.experience as Record<string, unknown>[]).map((exp) => {
        const expParts: string[] = [];
        if (exp.role) expParts.push(String(exp.role));
        if (exp.company) expParts.push(String(exp.company));
        if (exp.duration) expParts.push(String(exp.duration));
        if (exp.description) expParts.push(String(exp.description));
        return expParts.join(', ');
      });
      parts.push(`Experience: ${experienceTexts.join('; ')}`);
    }
  }
  
  // Add companies if separately listed
  if (Array.isArray(resumeData.companies) && resumeData.companies.length > 0) {
    parts.push(`Companies: ${resumeData.companies.join(', ')}`);
  }
  
  // Add projects if available
  if (resumeData.projects) {
    if (typeof resumeData.projects === 'string') {
      parts.push(`Projects: ${resumeData.projects}`);
    } else if (Array.isArray(resumeData.projects)) {
      const projectTexts = (resumeData.projects as Record<string, unknown>[]).map((proj) => {
        const projParts: string[] = [];
        if (proj.name) projParts.push(String(proj.name));
        if (proj.description) projParts.push(String(proj.description));
        if (proj.technologies) projParts.push(String(proj.technologies));
        return projParts.join(', ');
      });
      parts.push(`Projects: ${projectTexts.join('; ')}`);
    }
  }
  
  // Additional sections
  if (resumeData.certifications) {
    if (typeof resumeData.certifications === 'string') {
      parts.push(`Certifications: ${resumeData.certifications}`);
    } else if (Array.isArray(resumeData.certifications)) {
      parts.push(`Certifications: ${(resumeData.certifications as string[]).join(', ')}`);
    }
  }
  
  // Join all parts with newlines
  return parts.join('\n');
}

/**
 * Truncates text to a maximum length while preserving complete words
 * @param text The text to truncate
 * @param maxLength Maximum length of the truncated text
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 5000): string {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space before the maxLength
  const lastSpace = text.lastIndexOf(' ', maxLength);
  
  // If no space found, just cut at maxLength
  return lastSpace > 0 ? text.substring(0, lastSpace) : text.substring(0, maxLength);
}

/**
 * Processes a search query to optimize it for embeddings
 * @param query Raw search query from user
 * @returns Processed query
 */
export function processSearchQuery(query: string): string {
  if (!query) return '';
  
  // Remove excess whitespace
  const trimmedQuery = query.trim().replace(/\s+/g, ' ');
  
  // Remove special characters that might interfere with embeddings
  return trimmedQuery.replace(/[^\w\s]/gi, ' ').trim();
} 
// Dynamic import to avoid browser compatibility issues
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const getAnthropicClient = () => {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '', // Ensure this is set in your .env file
  });
};

/**
 * Generate resume feedback using Anthropic Claude
 * @param resumeContent The text content extracted from the PDF
 * @param targetRole The role the user is targeting
 * @param targetCompany The company or industry the user is targeting
 * @param careerLevel The career level of the user
 * @returns A string containing the formatted feedback
 */
export async function generateResumeFeedback(
  resumeContent: string,
  targetRole: string,
  targetCompany: string = '',
  careerLevel: string = 'entry'
): Promise<string> {
  // Map career level values to human-readable versions
  const careerLevelMap: Record<string, string> = {
    'intern': 'internship',
    'entry': 'entry-level',
    'mid': 'mid-level',
    'senior': 'senior',
    'executive': 'executive-level'
  };

  const readableCareerLevel = careerLevelMap[careerLevel] || careerLevel;
  
  // Check if we have valid resume content
  const isValidContent = resumeContent && 
                       resumeContent.length > 50 && 
                       !resumeContent.startsWith("Failed to extract") &&
                       !resumeContent.startsWith("PDF file appears");
  
  // Build a prompt for Claude
  let prompt;
  
  if (isValidContent) {
    // Standard prompt with resume content
    prompt = `
You are an expert resume reviewer and career coach with 15+ years experience helping people land jobs at top companies.

I need you to review a resume and provide detailed, personalized feedback. The resume is being prepared for a ${readableCareerLevel} ${targetRole} position${targetCompany ? ` at ${targetCompany}` : ''}.

Here is the resume content:
---
${resumeContent}
---`;
  } else {
    // Alternative prompt for when we couldn't extract text
    prompt = `
You are an expert resume reviewer and career coach with 15+ years experience helping people land jobs at top companies.

I need you to provide general resume guidance for someone applying for a ${readableCareerLevel} ${targetRole} position${targetCompany ? ` at ${targetCompany}` : ''}.

Note: We were unable to extract the text from the uploaded resume, so please provide general best practices for this specific role and level instead of personalized feedback.
`;
  }

  prompt += `
Please provide comprehensive, actionable feedback in the following format:

# Resume Feedback for ${targetRole} Position${targetCompany ? ` at ${targetCompany}` : ''}

## Overall Assessment
[Provide a brief overall assessment of the resume's effectiveness for the target position]

## Strengths
[List 3-4 specific strengths of the resume]

## Areas for Improvement
[List 3-5 specific areas where the resume could be improved]

## Content & Structure
[Analyze the overall structure, organization, and content of the resume]

## Impact & Achievement Focus
[Evaluate how well the resume demonstrates accomplishments and impact rather than just listing responsibilities]

## ATS Optimization
[Suggest keywords and phrases that should be included to pass Applicant Tracking Systems for the target role]

## Specific Recommendations
[Provide 5-7 actionable recommendations for improving the resume]

Be specific, honest, and constructive. Focus on helping the candidate improve their resume's effectiveness for their target role.
`;

  try {
    // Get a new client instance
    const anthropic = getAnthropicClient();
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      temperature: 0.2,
      system: "You are an expert resume coach who provides detailed, professional feedback.",
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    // Extract and return the feedback
    return response.content[0].text;
  } catch (error) {
    console.error('Error generating feedback with Claude:', error);
    throw new Error('Failed to generate feedback with Claude');
  }
}
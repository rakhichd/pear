import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const body = await request.json();
    
    // Extract data from the request
    const {
      resumeText,
      targetRole,
      targetCompany,
      careerLevel,
    } = body;
    
    if (!resumeText || !targetRole || !careerLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique ID for this feedback request
    const feedbackId = crypto.randomUUID();
    
    // Define the local path where the feedback will be saved
    const dataDir = path.join(process.cwd(), 'data', 'feedback');
    const feedbackDir = path.join(dataDir, feedbackId);
    
    // Create directories if they don't exist
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(feedbackDir, { recursive: true });
    
    // Store metadata in a JSON file
    const feedbackData = {
      id: feedbackId,
      type: 'text',
      targetRole,
      targetCompany,
      careerLevel,
      createdAt: new Date().toISOString(),
    };

    // Save the metadata to a JSON file
    const metadataPath = path.join(feedbackDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(feedbackData, null, 2));

    // Save the resume text to a file
    const resumeTextPath = path.join(feedbackDir, 'resume-text.txt');
    await fs.writeFile(resumeTextPath, resumeText);

    let feedback = '';
    
    // Check for API key
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('ANTHROPIC_API_KEY found, proceeding with Claude analysis');
      try {
        // Map career level values to human-readable versions
        const careerLevelMap: Record<string, string> = {
          'intern': 'internship',
          'entry': 'entry-level',
          'mid': 'mid-level',
          'senior': 'senior',
          'executive': 'executive-level'
        };
        const readableCareerLevel = careerLevelMap[careerLevel] || careerLevel;
        
        // Build prompt based on the resume text
        const prompt = `
You are an expert resume reviewer and career coach with 15+ years experience helping people land jobs at top companies.

I need you to review a resume and provide detailed, personalized feedback. The resume is being prepared for a ${readableCareerLevel} ${targetRole} position${targetCompany ? ` at ${targetCompany}` : ''}.

Here is the resume content:
---
${resumeText}
---

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

Be specific, honest, and constructive. Focus on helping the candidate improve their resume's effectiveness for their target role.`;
        
        // Call Claude API
        console.log('Calling Claude API...');
        try {
          const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
          });
          
          const response = await anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 4000,
            temperature: 0.2,
            system: "You are an expert resume coach who provides detailed, professional feedback.",
            messages: [
              { role: 'user', content: prompt }
            ],
          });
          
          feedback = response.content[0].text;
          console.log('Successfully received feedback from Claude');
        } catch (claudeError) {
          console.error('Error calling Claude API:', claudeError);
          feedback = generateFallbackFeedback(targetRole, careerLevel, targetCompany);
        }
      } catch (error) {
        console.error('Error in Claude analysis:', error);
        feedback = generateFallbackFeedback(targetRole, careerLevel, targetCompany);
      }
    } else {
      console.log('No ANTHROPIC_API_KEY found, using fallback feedback');
      feedback = generateFallbackFeedback(targetRole, careerLevel, targetCompany);
    }
    
    // Save the feedback to a file
    const feedbackPath = path.join(feedbackDir, 'feedback.md');
    await fs.writeFile(feedbackPath, feedback);

    return NextResponse.json({
      success: true,
      feedbackId,
      feedback,
    });
  } catch (error) {
    console.error('Error processing resume text feedback:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume text' },
      { status: 500 }
    );
  }
}

function generateFallbackFeedback(targetRole: string, careerLevel: string, targetCompany: string = ''): string {
  const careerLevelMap: Record<string, string> = {
    'intern': 'internship',
    'entry': 'entry-level',
    'mid': 'mid-level',
    'senior': 'senior',
    'executive': 'executive-level'
  };

  const readableCareerLevel = careerLevelMap[careerLevel] || careerLevel;
  const companyInfo = targetCompany ? ` at ${targetCompany}` : '';
  
  return `# Resume Feedback for ${targetRole} Position${companyInfo}

## Overall Assessment
Here are some general best practices for a ${readableCareerLevel} ${targetRole} position${companyInfo}.

## Content & Structure Recommendations
- **Professional Summary**: Start with a concise summary highlighting your relevant skills and experience for the ${targetRole} role.
- **Skills Section**: Clearly list technical and soft skills relevant to ${targetRole} positions.
- **Work Experience**: Focus on achievements and quantifiable results rather than just responsibilities.
- **Education**: List relevant degrees, certifications, and specialized training.
- **Project Experience**: Include relevant projects that demonstrate your capabilities in this field.

## Formatting Tips
- Use a clean, professional design appropriate for your industry
- Ensure consistent formatting throughout (fonts, spacing, bullet points)
- Make your resume ATS-friendly by using standard section headings
- Limit to 1-2 pages (depending on experience level)
- Use bullet points for easy scanning

## Keywords for ${targetRole} Positions
Include relevant keywords for your field to help pass ATS screening. Research job descriptions for ${targetRole} positions${companyInfo} and incorporate those terms.

## Next Steps
Consider sharing your resume with peers in your industry for additional feedback. Research the specific requirements for ${targetRole} positions${companyInfo} and tailor your resume accordingly.
`;
}
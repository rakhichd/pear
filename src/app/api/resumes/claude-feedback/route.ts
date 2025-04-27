import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { extractTextFromPdfBuffer } from '@/utils/pdfjs-utils';
import Anthropic from '@anthropic-ai/sdk';

// Config for Next.js API route
export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

export async function POST(request: NextRequest) {
  // Set proper headers for the response
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  try {
    console.log('Starting PDF processing...');
    const formData = await request.formData();
    
    // Extract file and metadata from the request
    const file = formData.get('file') as File;
    const targetRole = formData.get('targetRole') as string;
    const targetCompany = formData.get('targetCompany') as string;
    const careerLevel = formData.get('careerLevel') as string;
    
    if (!file || !targetRole || !careerLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique ID for this feedback request
    const feedbackId = crypto.randomUUID();
    
    // Get file buffer from the File object
    const fileBuffer = await file.arrayBuffer();

    // Define the local path where the file will be saved
    const dataDir = path.join(process.cwd(), 'data', 'feedback');
    const feedbackDir = path.join(dataDir, feedbackId);
    
    // Create directories if they don't exist
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(feedbackDir, { recursive: true });
    
    // Save the file to the local filesystem
    const filePath = path.join(feedbackDir, file.name);
    await fs.writeFile(filePath, Buffer.from(fileBuffer));
    console.log(`File saved successfully to ${filePath}`);
    
    // Store metadata in a JSON file
    const feedbackData = {
      id: feedbackId,
      fileName: file.name,
      filePath: filePath.replace(process.cwd(), ''),
      targetRole,
      targetCompany,
      careerLevel,
      createdAt: new Date().toISOString(),
    };

    // Save the metadata to a JSON file
    const metadataPath = path.join(feedbackDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(feedbackData, null, 2));

    let feedback = '';
    
    // Check for API key and try to extract text from PDF
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('ANTHROPIC_API_KEY found, proceeding with Claude analysis');
      try {
        // Try multiple approaches to extract text
        console.log('Extracting text from PDF...');
        let resumeText = '';
        
        // Approach 1: Using our utility
        try {
          resumeText = await extractTextFromPdfBuffer(fileBuffer);
          console.log(`Approach 1: Extracted ${resumeText.length} characters of text`);
        } catch (extractError) {
          console.error('Approach 1 failed:', extractError);
        }
        
        // Approach 2: Direct pdf-parse if first approach failed
        if (!resumeText || resumeText.includes('Error extracting text')) {
          try {
            const pdfParse = (await import('pdf-parse')).default;
            const result = await pdfParse(Buffer.from(fileBuffer));
            resumeText = result.text;
            console.log(`Approach 2: Extracted ${resumeText.length} characters of text`);
          } catch (parseError) {
            console.error('Approach 2 failed:', parseError);
          }
        }
        
        // If both approaches failed
        if (!resumeText || resumeText.includes('Error extracting text')) {
          console.warn('All text extraction approaches failed');
          resumeText = 'Unable to extract text from the PDF.';
        }
        
        // Map career level values to human-readable versions
        const careerLevelMap: Record<string, string> = {
          'intern': 'internship',
          'entry': 'entry-level',
          'mid': 'mid-level',
          'senior': 'senior',
          'executive': 'executive-level'
        };
        const readableCareerLevel = careerLevelMap[careerLevel] || careerLevel;
        
        // Determine if we have valid content to analyze
        const hasValidContent = resumeText.length > 100 && 
                               !resumeText.includes('Unable to extract');
        
        // Build prompt based on available content
        let prompt = '';
        if (hasValidContent) {
          prompt = `
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
        } else {
          prompt = `
You are an expert resume reviewer and career coach with 15+ years experience helping people land jobs at top companies.

I need you to provide general resume guidance for someone applying for a ${readableCareerLevel} ${targetRole} position${targetCompany ? ` at ${targetCompany}` : ''}.

Note: We were unable to extract the text from the uploaded resume, so please provide general best practices for this specific role and level instead of personalized feedback.

Please provide comprehensive, actionable feedback in the following format:

# Resume Feedback for ${targetRole} Position${targetCompany ? ` at ${targetCompany}` : ''}

## Overall Assessment
[Provide a brief overview of what makes an effective resume for this role and level]

## Key Elements to Include
[List the most important sections and content to include for this specific role]

## Content & Structure Best Practices
[Provide guidance on how to structure a resume for this role]

## Impact & Achievement Focus
[Explain how to effectively showcase achievements for this role and level]

## ATS Optimization
[Suggest keywords and phrases that should be included to pass Applicant Tracking Systems for the target role]

## Specific Recommendations
[Provide 5-7 actionable best practices for this specific role and level]`;
        }
        
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

    // Ensure we return a valid JSON response with proper headers
    return new NextResponse(
      JSON.stringify({
        success: true,
        feedbackId,
        feedback,
        filePath: filePath.replace(process.cwd(), ''),
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        } 
      }
    );
  } catch (error) {
    console.error('Error processing resume feedback:', error);
    
    // Return error with proper headers
    return new NextResponse(
      JSON.stringify({ error: 'Failed to analyze resume' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        } 
      }
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
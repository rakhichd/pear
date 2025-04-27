import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
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
    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.mkdir(feedbackDir, { recursive: true });
    } catch (dirError) {
      console.error('Error creating directories:', dirError);
      throw new Error('Failed to create directories for feedback storage');
    }
    
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

    // Generate simple feedback based on role and career level
    const feedback = generateFeedback(targetRole, careerLevel, targetCompany);
    
    // Save the feedback to a file
    const feedbackPath = path.join(feedbackDir, 'feedback.md');
    await fs.writeFile(feedbackPath, feedback);

    return NextResponse.json({
      success: true,
      feedbackId,
      feedback,
      filePath: filePath.replace(process.cwd(), ''),
    });
  } catch (error) {
    console.error('Error processing resume feedback:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}

function generateFeedback(targetRole: string, careerLevel: string, targetCompany: string = ''): string {
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
Your resume has been successfully uploaded and saved. Here are some general best practices for a ${readableCareerLevel} ${targetRole} position${companyInfo}.

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
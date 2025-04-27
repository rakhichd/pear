import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
// Import modules dynamically to avoid any server initialization issues

// Helper function to check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

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
    const additionalContext = formData.get('additionalContext') as string;
    
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
    
    // Store metadata in a JSON file
    const feedbackData = {
      id: feedbackId,
      fileName: file.name,
      filePath: filePath.replace(process.cwd(), ''),
      targetRole,
      targetCompany,
      careerLevel,
      additionalContext,
      createdAt: new Date().toISOString(),
    };

    // Save the metadata to a JSON file
    const metadataPath = path.join(feedbackDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(feedbackData, null, 2));

    let feedback;
    
    // Check if ANTHROPIC_API_KEY is set
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // Read the PDF file
        console.log(`Reading PDF file from: ${filePath}`);
        
        // Check if file exists
        if (!await fileExists(filePath)) {
          console.error(`PDF file does not exist at path: ${filePath}`);
          throw new Error(`PDF file not found at ${filePath}`);
        }
        
        console.log(`File exists, reading file...`);
        const fileBuffer = await fs.readFile(filePath);
        console.log(`File read successfully, size: ${fileBuffer.length} bytes`);
        
        // Extract the PDF text directly in the API route
        let resumeText;
        try {
          // Import pdf-parse dynamically
          const pdfParse = (await import('pdf-parse')).default;
          
          try {
            // Parse the PDF
            const pdfData = await pdfParse(fileBuffer);
            resumeText = pdfData.text;
            
            if (resumeText && resumeText.length > 0) {
              console.log(`Successfully extracted ${resumeText.length} characters from PDF`);
              console.log('Sample text:', resumeText.slice(0, 200) + '...');
            } else {
              console.warn('PDF parsing succeeded but returned no text');
              resumeText = "PDF file appears to contain no extractable text. It may be image-based or scanned.";
            }
          } catch (parseError) {
            console.error('Error parsing PDF:', parseError);
            resumeText = "Failed to extract text from PDF. Using generic content for feedback instead.";
          }
        } catch (importError) {
          console.error('Error importing pdf-parse:', importError);
          resumeText = "PDF processing module could not be loaded. Using generic content for feedback.";
        }
        
        try {
          // Import the Claude helper dynamically
          const { generateResumeFeedback } = await import('@/lib/claude');
          
          // Generate feedback using Claude
          feedback = await generateResumeFeedback(
            resumeText, 
            targetRole, 
            targetCompany, 
            careerLevel
          );
        } catch (claudeError) {
          console.error('Error using Claude for feedback:', claudeError);
          // Fall back to mock feedback if Claude fails
          feedback = generateMockFeedback(targetRole, careerLevel, targetCompany, additionalContext);
        }
      } catch (extractError) {
        console.error('Error extracting text from PDF:', extractError);
        // Fall back to mock feedback if text extraction fails
        feedback = generateMockFeedback(targetRole, careerLevel, targetCompany, additionalContext);
      }
    } else {
      console.log('ANTHROPIC_API_KEY not set, using mock feedback instead');
      // Use mock feedback if API key is not set
      feedback = generateMockFeedback(targetRole, careerLevel, targetCompany, additionalContext);
    }
    
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

function generateMockFeedback(
  targetRole: string, 
  careerLevel: string, 
  targetCompany: string = '',
  additionalContext: string = ''
): string {
  const careerLevelMap: Record<string, string> = {
    'entry': 'entry-level',
    'mid': 'mid-level',
    'senior': 'senior',
    'executive': 'executive-level'
  };

  const readableCareerLevel = careerLevelMap[careerLevel] || careerLevel;
  const companyContext = targetCompany ? ` at ${targetCompany}` : '';

  const feedback = `# Resume Feedback for ${targetRole} Position${companyContext}

## Overall Assessment
Your resume shows potential for a ${readableCareerLevel} ${targetRole} position${companyContext}. Below are key observations and recommendations to strengthen your application.

## Content & Structure
- Your experience section effectively highlights your technical background, but could benefit from more quantifiable achievements.
- The skill section is comprehensive, but consider prioritizing skills most relevant to the ${targetRole} position.
- Your education section is well-structured, but could use more emphasis on relevant coursework or projects if you're early in your career.

## Impact & Achievement Focus
- Consider reformatting your bullet points to follow the "accomplished X as measured by Y by doing Z" format to better demonstrate impact.
- Add more metrics and specific outcomes to your achievements to demonstrate your value.
- For a ${targetRole} role${companyContext}, emphasize more of your experience with [relevant skills/technologies].

## Recommendations
1. Add more quantifiable achievements to showcase your impact (e.g., "Increased system performance by 40% by implementing...")
2. Tailor your skills section to more closely match the keywords from ${targetRole} job descriptions${companyContext ? ' at ' + targetCompany : ''}.
3. Consider adding a brief professional summary that positions you specifically for a ${targetRole} role.
4. Ensure your formatting is consistent and ATS-friendly with standard section headings.

## Next Steps
Consider revising your resume based on these recommendations and sharing it with our community for more specific feedback. If you're targeting ${targetCompany || 'specific companies'}, research their values and incorporate relevant experiences that align with their mission.`;

  return feedback;
}
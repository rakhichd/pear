import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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
    
    // Store the resume file for analysis
    const fileBuffer = await file.arrayBuffer();
    const storage = getStorage();
    const storageRef = ref(storage, `feedback-requests/${feedbackId}/${file.name}`);
    
    await uploadBytesResumable(storageRef, new Uint8Array(fileBuffer));
    const downloadURL = await getDownloadURL(storageRef);

    // In a real application, you would:
    // 1. Extract text from the PDF
    // 2. Analyze it using an ML model or send to an API
    // 3. Generate feedback based on target role, career level, etc.
    
    // For this example, we'll provide mock feedback
    const feedback = generateMockFeedback(targetRole, careerLevel, targetCompany, additionalContext);

    return NextResponse.json({
      success: true,
      feedbackId,
      feedback,
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
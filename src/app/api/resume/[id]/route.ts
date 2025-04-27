import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { doc, getDoc } from 'firebase/firestore'; // Add this import for Firestore

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resumeId = params.id;

    if (!resumeId) {
      console.log('Resume ID is missing in request');
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching resume with ID: ${resumeId}`);

    // Fetch the resume from Firestore
    const resumeRef = doc(db, 'resumes', resumeId);
    let resumeSnap;

    try {
      resumeSnap = await getDoc(resumeRef);
    } catch (fetchError) {
      console.error(`Error getting document from Firestore: ${fetchError.message}`);
      throw new Error(`Database fetch error: ${fetchError.message}`);
    }

    if (resumeSnap.exists()) {
      // If the resume exists in Firestore, return the Firestore data
      const resumeData = resumeSnap.data();
      console.log(`Resume found. Title: ${resumeData.title}`);

      // Format the resume data
      const formattedResumeData = {
        id: resumeSnap.id,
        ...resumeData,
        // Convert Firestore timestamp to ISO string if it exists
        lastUpdated: resumeData.lastUpdated
          ? typeof resumeData.lastUpdated.toDate === 'function'
            ? resumeData.lastUpdated.toDate().toISOString()
            : resumeData.lastUpdated
          : new Date().toISOString(),
      };

      return NextResponse.json({ resume: formattedResumeData });
    }

    console.log(`Resume not found in Firestore. Falling back to local filesystem.`);

    // If the resume does not exist in Firestore, fetch it from the local filesystem
    const dataDir = path.join(process.cwd(), 'data', 'resumes');
    const metadataPath = path.join(dataDir, resumeId, 'metadata.json');

    let localResumeData;
    try {
      const fileContent = await fs.readFile(metadataPath, 'utf-8');
      localResumeData = JSON.parse(fileContent);
    } catch (err) {
      console.error('Error reading resume file:', err);

      return NextResponse.json(
        { error: 'Resume not found in local filesystem' },
        { status: 404 }
      );
    }

    console.log(`Resume found in local filesystem. Title: ${localResumeData.title}`);

    // Return the local resume data
    return NextResponse.json({ resume: localResumeData });
  } catch (error: any) {
    console.error('Error fetching resume:', error);
    console.error('Stack trace:', error.stack);

    return NextResponse.json(
      { error: `Failed to fetch resume: ${error.message}` },
      { status: 500 }
    );
  }
}

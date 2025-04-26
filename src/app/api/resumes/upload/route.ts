import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
    const title = formData.get('title') as string;
    const role = formData.get('role') as string;
    const company = formData.get('company') as string;
    const experiences = formData.get('experiences') as string;
    const education = formData.get('education') as string;
    const skills = formData.get('skills') as string;
    const result = formData.get('result') as string;
    
    if (!file || !title || !role || !skills || !result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the resume
    const resumeId = crypto.randomUUID();
    
    // Get file buffer from the File object
    const fileBuffer = await file.arrayBuffer();

    // Upload to Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `resumes/${resumeId}/${file.name}`);
    
    const uploadTask = await uploadBytesResumable(storageRef, new Uint8Array(fileBuffer));
    const downloadURL = await getDownloadURL(uploadTask.ref);

    // Store metadata in Firestore
    const resumeData = {
      id: resumeId,
      title,
      fileName: file.name,
      fileURL: downloadURL,
      role,
      company,
      experiences,
      education,
      skills: skills.split(',').map(skill => skill.trim()),
      result,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'resumes', resumeId), resumeData);

    // Trigger the resume indexing process
    await fetch(`${request.nextUrl.origin}/api/resumes/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeId }),
    });

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeId
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}
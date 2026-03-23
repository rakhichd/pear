import { NextRequest, NextResponse } from 'next/server';
import { getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { ResumeData } from '@/types';
import pdfParse from 'pdf-parse';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file');
    const roleRaw = formData.get('role');
    const resultRaw = formData.get('result');
    const titleRaw = formData.get('title');
    const skillsRaw = formData.get('skills');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A PDF file is required' }, { status: 400 });
    }

    const role = typeof roleRaw === 'string' ? roleRaw.trim() : '';
    const result = typeof resultRaw === 'string' ? resultRaw.trim() : '';

    if (!role || !result) {
      return NextResponse.json(
        { error: 'Role and result (interviews/offers) are required' },
        { status: 400 },
      );
    }

    if (file.type && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    const resumeId = crypto.randomUUID();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    let extractedText = '';
    try {
      const parsed = await pdfParse(fileBuffer);
      extractedText = (parsed.text || '').trim();
    } catch (parseErr) {
      console.warn('PDF text extraction failed:', parseErr);
      extractedText = '';
    }

    const title =
      (typeof titleRaw === 'string' && titleRaw.trim()) ||
      `${role} resume`;

    const skillsFromForm =
      typeof skillsRaw === 'string' && skillsRaw.trim()
        ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const offers = result
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const storage = getStorage(getApp());
    const storageRef = ref(storage, `resumes/${resumeId}/${file.name}`);

    await uploadBytes(storageRef, fileBuffer, { contentType: 'application/pdf' });
    const downloadURL = await getDownloadURL(storageRef);

    const now = Date.now();
    const resumeData: ResumeData = {
      id: resumeId,
      title,
      author: 'Community',
      lastUpdated: new Date().toISOString(),
      education: '',
      yearsExperience: '',
      skills: skillsFromForm,
      offers,
      interviews: [],
      content: extractedText || `[Uploaded PDF: ${file.name}. Text could not be extracted.]`,
      createdAt: now,
      updatedAt: now,
      isPublic: true,
      role,
      experienceLevel: 'mid',
      companies: [],
      educationLevel: 'bachelor',
      formattingStyle: 'professional',
      pdfUrl: downloadURL,
      pdfFilename: file.name,
      category: 'COMMUNITY',
    };

    await setDoc(doc(db, 'resumes', resumeId), resumeData);

    const indexUrl = new URL('/api/resumes/index', request.nextUrl.origin);
    try {
      const indexRes = await fetch(indexUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });
      if (!indexRes.ok) {
        const errText = await indexRes.text();
        console.error('Pinecone index returned', indexRes.status, errText);
      }
    } catch (indexErr) {
      console.error('Pinecone indexing failed (upload still saved):', indexErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeId,
    });
  } catch (error: unknown) {
    console.error('Error uploading resume:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload resume';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

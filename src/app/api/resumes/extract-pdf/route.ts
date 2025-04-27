import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import pdfParse from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check if the file is a PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }
    
    // Get file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Parse PDF content
    try {
      const pdfData = await pdfParse(fileBuffer);
      
      return NextResponse.json({
        success: true,
        text: pdfData.text,
        info: {
          pageCount: pdfData.numpages,
          isEncrypted: pdfData.encrypted,
        }
      });
    } catch (pdfError) {
      console.error('Error parsing PDF:', pdfError);
      return NextResponse.json(
        { error: 'Failed to parse PDF content' },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error('Error processing PDF extraction request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
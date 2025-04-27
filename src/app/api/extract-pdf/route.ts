import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import * as pdfParse from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Check if file is PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }
    
    // Get file bytes
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    
    // Use two different PDF libraries to maximize chances of success
    let extractedText = '';
    let method = '';
    
    // First try with pdf-lib
    try {
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      method = 'pdf-lib';
      console.log(`PDF has ${pageCount} pages`);
      
      // If pdf-lib loaded the document, it's valid, now try pdf-parse for text
      try {
        const data = await pdfParse.default(fileBuffer);
        extractedText = data.text;
        method = 'pdf-parse';
        console.log(`Extracted ${extractedText.length} characters using pdf-parse`);
      } catch (parseError) {
        console.error('pdf-parse failed:', parseError);
        extractedText = `Could not extract text content. This PDF may be image-based, scanned, or protected.`;
      }
      
    } catch (pdfLibError) {
      console.error('pdf-lib failed to load the PDF:', pdfLibError);
      return NextResponse.json({ 
        error: 'Failed to process PDF',
        details: pdfLibError.message
      }, { status: 422 });
    }
    
    return NextResponse.json({
      success: true,
      text: extractedText,
      method,
      characterCount: extractedText.length,
    });
    
  } catch (error) {
    console.error('General error in PDF extraction:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error.message
    }, { status: 500 });
  }
}
// Simple text-based PDF extraction using pdf-parse
import pdfParse from 'pdf-parse';

/**
 * Extract text from a PDF file using pdf-parse
 * 
 * @param pdfData Buffer or ArrayBuffer containing the PDF data
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromPdfBuffer(pdfData: ArrayBuffer): Promise<string> {
  try {
    // Convert ArrayBuffer to Buffer for pdf-parse
    const buffer = Buffer.from(pdfData);
    
    // Parse options
    const options = {
      // Limit to first 10 pages for performance
      max: 10,
      // Return version info in the info object
      version: true
    };
    
    // Parse the PDF
    console.log('Starting PDF parsing with pdf-parse...');
    const result = await pdfParse(buffer, options);
    
    console.log(`PDF parsed: ${result.numpages} pages, text length: ${result.text.length}`);
    
    // Check if we got meaningful text
    if (result.text.trim().length < 50) {
      console.warn('Extracted text is very short, PDF might be scanned or contain mostly images');
    }
    
    return result.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    // Return empty string instead of throwing to avoid breaking the flow
    return "Error extracting text from PDF. The file may be corrupted, password-protected, or in an unsupported format.";
  }
}
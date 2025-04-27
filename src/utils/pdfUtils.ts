import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

/**
 * Extract text content from a PDF file
 * @param filePath Path to the PDF file
 * @returns Promise that resolves to the extracted text content
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`PDF file not found at path: ${filePath}`);
      console.error(`Current working directory: ${process.cwd()}`);
      console.error(`Absolute path: ${path.resolve(filePath)}`);
      return "Unable to extract text from PDF. File not found.";
    }
    
    // Read the PDF file as a buffer
    const dataBuffer = fs.readFileSync(filePath);
    
    // Check buffer size
    if (!dataBuffer || dataBuffer.length === 0) {
      console.error('PDF file is empty or could not be read');
      return "PDF file appears to be empty or could not be read properly.";
    }
    
    try {
      // Parse the PDF with options
      const options = {
        // Limit to first 10 pages to avoid processing very large PDFs
        max: 10
      };
      const data = await pdfParse(dataBuffer, options);
      
      // Check if text was extracted
      if (!data.text || data.text.trim().length === 0) {
        console.warn('No text content extracted from PDF');
        return "No text content could be extracted from the PDF. It may be scanned or image-based.";
      }
      
      // Return the text content
      return data.text;
    } catch (parseError) {
      console.error('Error parsing PDF:', parseError);
      return "Failed to parse PDF content. Please ensure it's a valid PDF document.";
    }
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return "An error occurred while processing the PDF file.";
  }
}
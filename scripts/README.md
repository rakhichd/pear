# Resume Processing Scripts

This directory contains scripts for managing resumes in the ResumeFind application.

## process-resume.js

This script processes a PDF resume, extracts its content, analyzes it with Claude AI, and stores both the data and the vector embedding in the databases.

### Prerequisites

Before running the script, make sure you have:

1. A PDF resume file to process
2. Your `.env` file configured with the following variables:
   - `ANTHROPIC_API_KEY` - Your Claude API key
   - `PINECONE_API_KEY` - Your Pinecone API key
   - `PINECONE_INDEX_NAME` - Name of your Pinecone index (default: resumefind)
   - Firebase configuration variables

### Installation

```bash
# Install dependencies
npm install pdf-parse @anthropic-ai/sdk uuid
```

### Usage

```bash
# Basic usage
node scripts/process-resume.js /path/to/your/resume.pdf

# Example
node scripts/process-resume.js data/resumes/SWE/john_doe_resume.pdf
```

The script will:
1. Extract text from the PDF
2. Use Claude to extract structured information
3. Copy the PDF to the public directory for serving
4. Store the data in Firestore
5. Generate an embedding and store in Pinecone

### Output

The script will output a unique resume ID that can be used to access the resume.

## wipe-pinecone.js

This script wipes all records from the Pinecone vector database.

### Usage

```bash
node scripts/wipe-pinecone.js
```

## delete-resumes.js

This script deletes specific resumes from both Firestore and Pinecone.

### Usage

```bash
# Edit the script to specify which resume IDs to delete, then run:
node scripts/delete-resumes.js
``` 
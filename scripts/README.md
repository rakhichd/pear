# Resume processing scripts

CLI tools for ingesting PDF resumes into Firestore and Pinecone.

## Scripts in this folder

| File | Purpose |
|------|---------|
| `ingest-csv.js` | Bulk ingest from `data/resumes/archive/Resume/Resume.csv` into Firestore + Pinecone (no Claude; uses CSV text) |
| `process-resume.js` | Full pipeline: PDF → Claude extraction → Firestore → Pinecone; copies PDF under `public/pdfs/resumes/` |
| `process-resume-simple.js` | Lighter variant (see file header) |
| `process-folder.js` | Runs processing for every PDF in a directory |

## Prerequisites

1. `.env` with Firebase, Pinecone, and Anthropic keys (see `.env.example`).
2. `ANTHROPIC_API_KEY` — Claude extracts structured fields from the resume PDF.
3. No separate embedding API needed — the Pinecone index uses integrated inference (`llama-text-embed-v2`).

## Usage

```bash
# Bulk CSV (see script header for paths and flags)
node scripts/ingest-csv.js --limit 50

# Single file
node scripts/process-resume.js /path/to/resume.pdf

# Entire folder of PDFs
node scripts/process-folder.js /path/to/folder
```

The script prints a resume ID you can use in the app.

## Dependencies

Project `package.json` already includes `pdf-parse`, `@anthropic-ai/sdk`, `uuid`, `dotenv`, Firebase, and Pinecone. No extra install is required beyond `npm install` at the repo root.

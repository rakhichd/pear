# ResumeFind

Next.js app for searching and browsing resume examples. Search uses **Pinecone** (vector embeddings) with **Firebase Firestore** for resume metadata. PDFs are served from `public/`; processing scripts live under `scripts/`.

## Quick start

```bash
npm install
cp .env.example .env
# Fill in Firebase, Pinecone, and API keys (see Environment below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

| Path | Purpose |
|------|---------|
| `src/app/` | App Router pages and layouts |
| `src/app/api/` | Route handlers (search, resumes CRUD, upload, feedback) |
| `src/lib/` | Firebase, Pinecone, resume helpers |
| `src/utils/` | Text processing and embedding generation |
| `src/types/` | Shared TypeScript types |
| `scripts/` | CLI tools to ingest PDFs into Firestore + Pinecone |
| `data/resumes/` | Sample CSVs and local PDFs for development |
| `public/pdfs/resumes/` | PDFs exposed to the browser (populated by ingestion) |

## Routes (index)

| URL | Description |
|-----|-------------|
| `/` | Marketing home with search to `/simple-search` |
| `/simple-search` | Lightweight search UI |
| `/main/search` | Full search with filters |
| `/main/resume/upload` | Upload flow |
| `/main/resume/feedback` | Feedback flow |
| `/main/resume/[id]` | Resume detail (main app shell) |
| `/resume/[id]` | Alternate resume view |
| `/auth/login`, `/auth/signup` | Auth UI |

## API routes

| Method | Path | Role |
|--------|------|------|
| `POST` | `/api/search` | Semantic + filtered search |
| `GET`/`PUT` | `/api/resumes/[id]` | Resume by ID |
| `POST` | `/api/resumes/upload` | Upload |
| `POST` | `/api/resumes/index` | Indexing |
| `POST` | `/api/resumes/feedback` | Feedback |
| `GET` | `/api/resume/[id]` | Legacy resume fetch |

## Environment

Copy `.env.example` to `.env` and set:

- **Firebase** — `NEXT_PUBLIC_FIREBASE_*` (client)
- **Pinecone** — `PINECONE_API_KEY`, `PINECONE_INDEX_NAME` (vectors use Pinecone integrated inference, `llama-text-embed-v2`)
- **Batch processing** — `ANTHROPIC_API_KEY` for `scripts/process-resume.js` (Claude structured extraction from PDFs)
- **Optional** — `NEXTAUTH_SECRET`, `NEXTAUTH_URL` if you wire up NextAuth later

## Scripts

See [`scripts/README.md`](scripts/README.md) for `ingest-csv.js`, `process-resume.js`, `process-resume-simple.js`, and `process-folder.js`.

## Stack

- **Next.js 15** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4**
- **Firebase** (Firestore), **Pinecone** (integrated embeddings for search)

#!/usr/bin/env node

/**
 * Bulk CSV ingestion script
 *
 * Reads data/resumes/archive/Resume/Resume.csv and ingests every resume into:
 *   - Firestore (resumes collection)
 *   - Pinecone (upsertRecords — llama-text-embed-v2 handles embedding)
 *
 * Why not Claude? 2484 resumes × Claude = hours + ~$20. The CSV already has
 * full text and category, which is all we need for good semantic search.
 *
 * Usage: node scripts/ingest-csv.js [--limit N] [--concurrency N]
 *   --limit       only ingest the first N rows (useful for testing)
 *   --concurrency parallel Pinecone/Firestore batches (default: 10)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Pinecone } = require('@pinecone-database/pinecone');
const { initializeApp } = require('firebase/app');
const { getFirestore, writeBatch, doc } = require('firebase/firestore');

// --- CLI args ---
const args = process.argv.slice(2);
const limitArg = args.indexOf('--limit');
const concArg = args.indexOf('--concurrency');
const LIMIT = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : Infinity;
const CONCURRENCY = 1; // single-threaded to stay well under 250K tokens/min
const PINECONE_BATCH = 25;
const TEXT_MAX_CHARS = 4000; // ~1000 tokens; still 4× better than old 1000-char limit
const FIRESTORE_BATCH = 400; // max per writeBatch

const CSV_PATH = path.join(
  __dirname,
  '../data/resumes/archive/Resume/Resume.csv'
);

// --- Firebase ---
const firebaseApp = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(firebaseApp);

// --- Pinecone ---
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || 'resumefind');

// -----------------------------------------------------------------------

function resumeIdFromCsvId(csvId) {
  return `resume-${csvId}`;
}

/**
 * Build the text Pinecone embeds. Full resume text gives the best semantic
 * search — no truncation needed since llama-text-embed-v2 handles long input.
 */
function buildEmbedText(row) {
  const parts = [`Category: ${row.Category}`];
  if (row.Resume_str) parts.push(row.Resume_str.trim().substring(0, TEXT_MAX_CHARS));
  return parts.join('\n\n');
}

async function flushToPinecone(records, retries = 5) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await index.upsertRecords(records);
      return;
    } catch (err) {
      const is429 = err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
      if (is429 && attempt < retries - 1) {
        const wait = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s, 16s, 32s
        process.stdout.write(`\n  Rate limited — retrying in ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}

async function flushToFirestore(docs) {
  // writeBatch maxes at 500 ops — chunk if needed
  for (let i = 0; i < docs.length; i += FIRESTORE_BATCH) {
    const batch = writeBatch(db);
    for (const { id, data } of docs.slice(i, i + FIRESTORE_BATCH)) {
      batch.set(doc(db, 'resumes', id), data);
    }
    await batch.commit();
  }
}

async function processBatch(rows) {
  const timestamp = Date.now();

  const pineconeRecords = rows.map(row => {
    const resumeId = resumeIdFromCsvId(row.ID);
    const pdfFilename = `${row.ID}.pdf`;
    const pdfUrl = `/pdfs/resumes/${row.Category}/${pdfFilename}`;
    return {
      id: resumeId,
      text: buildEmbedText(row),       // embedded by llama-text-embed-v2
      title: `${row.Category} Resume`,
      role: row.Category,
      experienceLevel: 'mid',          // unknown without Claude extraction
      skills: [],
      yearsExperience: '',
      companies: [],
      educationLevel: 'bachelor',
      education: '',
      interviews: [],
      offers: [],
      author: 'System Import',
      isPublic: true,
      formattingStyle: 'professional',
      category: row.Category,
      pdfFilename,
      pdfUrl,
      contentPreview: (row.Resume_str || '').substring(0, 500),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  const firestoreDocs = rows.map(row => {
    const resumeId = resumeIdFromCsvId(row.ID);
    const pdfFilename = `${row.ID}.pdf`;
    const pdfUrl = `/pdfs/resumes/${row.Category}/${pdfFilename}`;
    return {
      id: resumeId,
      data: {
        id: resumeId,
        title: `${row.Category} Resume`,
        role: row.Category,
        category: row.Category,
        pdfFilename,
        pdfUrl,
        experienceLevel: 'mid',
        skills: [],
        yearsExperience: '',
        companies: [],
        educationLevel: 'bachelor',
        education: '',
        interviews: [],
        offers: [],
        content: row.Resume_str || '',
        author: 'System Import',
        isPublic: true,
        formattingStyle: 'professional',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };
  });

  await Promise.all([
    flushToPinecone(pineconeRecords),
    flushToFirestore(firestoreDocs),
  ]);
}

// Run N async tasks with bounded concurrency
async function withConcurrency(items, concurrency, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const item = items[i++];
      results.push(await fn(item));
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

async function main() {
  console.log(`CSV: ${CSV_PATH}`);
  console.log(`Limit: ${LIMIT === Infinity ? 'all' : LIMIT} | Concurrency: ${CONCURRENCY} | Pinecone batch: ${PINECONE_BATCH}`);

  // 1. Read CSV into memory (fast enough for 2484 rows)
  const rows = await new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', row => {
        if (result.length < LIMIT) result.push(row);
      })
      .on('end', () => resolve(result))
      .on('error', reject);
  });

  console.log(`Loaded ${rows.length} rows from CSV`);

  // 2. Split into Pinecone-sized batches
  const batches = [];
  for (let i = 0; i < rows.length; i += PINECONE_BATCH) {
    batches.push(rows.slice(i, i + PINECONE_BATCH));
  }
  console.log(`Processing ${batches.length} batches...`);

  // 3. Process batches concurrently
  let done = 0;
  await withConcurrency(batches, CONCURRENCY, async batch => {
    await processBatch(batch);
    done += batch.length;
    process.stdout.write(`\r  ${done}/${rows.length} resumes indexed`);
    // Pace requests: 25 resumes × ~1000 tokens = 25K tokens per 10s = ~150K tokens/min (well under 250K limit)
    await new Promise(r => setTimeout(r, 10000));
  });

  console.log(`\nDone! ${rows.length} resumes in Firestore + Pinecone.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

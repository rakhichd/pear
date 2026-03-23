import { Pinecone } from '@pinecone-database/pinecone';
import { ResumeData } from '@/types';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

const indexName = process.env.PINECONE_INDEX_NAME || 'resumefind';
const index = pinecone.Index(indexName);

/**
 * Build the text that Pinecone's llama-text-embed-v2 will embed.
 * More structured context = better semantic search results.
 */
function prepareResumeText(resumeData: ResumeData): string {
  const parts: string[] = [];

  if (resumeData.title) parts.push(`Title: ${resumeData.title}`);
  if (resumeData.role) parts.push(`Role: ${resumeData.role}`);
  if (resumeData.experienceLevel) parts.push(`Experience Level: ${resumeData.experienceLevel}`);
  if (resumeData.yearsExperience) parts.push(`Years Experience: ${resumeData.yearsExperience}`);

  if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    parts.push(`Skills: ${resumeData.skills.join(', ')}`);
  }
  if (resumeData.education) parts.push(`Education: ${resumeData.education}`);
  if (Array.isArray(resumeData.companies) && resumeData.companies.length > 0) {
    parts.push(`Companies: ${resumeData.companies.join(', ')}`);
  }
  if (Array.isArray(resumeData.interviews) && resumeData.interviews.length > 0) {
    parts.push(`Interviews: ${resumeData.interviews.join(', ')}`);
  }
  if (Array.isArray(resumeData.offers) && resumeData.offers.length > 0) {
    parts.push(`Offers: ${resumeData.offers.join(', ')}`);
  }
  if (resumeData.content) {
    parts.push(`Content: ${resumeData.content.substring(0, 1000)}`);
  }

  return parts.join('\n');
}

const METADATA_FIELDS = [
  'title', 'role', 'experienceLevel', 'skills', 'yearsExperience',
  'companies', 'educationLevel', 'education', 'interviews', 'offers',
  'author', 'isPublic', 'formattingStyle', 'contentPreview', 'createdAt', 'updatedAt',
  'category', 'pdfUrl', 'pdfFilename',
];

export async function searchResumes(
  query: string,
  filterParams: Record<string, unknown> = {},
  limit: number = 10,
) {
  const filter = Object.keys(filterParams).length > 0 ? filterParams : undefined;

  const results = await index.searchRecords({
    query: {
      inputs: { text: query },
      topK: limit,
    },
    fields: METADATA_FIELDS,
    ...(filter ? { filter } : {}),
  });

  const hits = results.result.hits;

  // Normalize to the shape search/route.ts expects: { matches: [{ id, score, metadata }] }
  return {
    matches: hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      metadata: hit.fields,
    })),
  };
}

export async function indexResume(resumeId: string, resumeData: ResumeData) {
  await index.upsertRecords([{
    id: resumeId,
    // 'text' is the field llama-text-embed-v2 embeds
    text: prepareResumeText(resumeData),
    // Metadata fields (returned in search results and filterable)
    title: resumeData.title || '',
    role: resumeData.role || '',
    experienceLevel: resumeData.experienceLevel || 'mid',
    skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
    yearsExperience: resumeData.yearsExperience || '',
    companies: Array.isArray(resumeData.companies) ? resumeData.companies : [],
    educationLevel: resumeData.educationLevel || 'bachelor',
    education: resumeData.education || '',
    interviews: Array.isArray(resumeData.interviews) ? resumeData.interviews : [],
    offers: Array.isArray(resumeData.offers) ? resumeData.offers : [],
    author: resumeData.author || '',
    isPublic: resumeData.isPublic === true,
    formattingStyle: resumeData.formattingStyle || 'professional',
    contentPreview: resumeData.content ? resumeData.content.substring(0, 500) : '',
    category: resumeData.category || '',
    pdfUrl: resumeData.pdfUrl || '',
    pdfFilename: resumeData.pdfFilename || '',
    createdAt: resumeData.createdAt || Date.now(),
    updatedAt: resumeData.updatedAt || Date.now(),
  }]);

  return { success: true };
}

export async function deleteResumeFromIndex(resumeId: string) {
  await index.deleteOne(resumeId);
  return { success: true };
}

export default pinecone;

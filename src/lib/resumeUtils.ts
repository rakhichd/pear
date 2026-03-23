import type { SearchResultItem } from '@/types';

export type PdfUrlOptions = {
  pdfUrl?: string;
  pdfFilename?: string;
};

/**
 * Build the public URL for a resume PDF under /public/pdfs/resumes/.
 *
 * CSV-ingested rows use document IDs like `resume-17915015` while files on disk are
 * `{Category}/17915015.pdf` — we strip the `resume-` prefix for the filename unless
 * `pdfUrl` / `pdfFilename` is already stored on the document.
 */
export function getResumePdfUrl(
  resumeId: string,
  category?: string,
  options?: PdfUrlOptions,
): string {
  if (resumeId === 'winston') {
    return '/pdfs/resumes/PERSONAL/Winston_s_Resume (9).pdf';
  }

  if (options?.pdfUrl) {
    const u = options.pdfUrl.trim();
    return u.startsWith('/') ? u : `/${u}`;
  }

  if (options?.pdfFilename) {
    const name = options.pdfFilename.trim();
    if (category) {
      return `/pdfs/resumes/${encodePathSegment(category)}/${encodePathSegment(name)}`;
    }
    return `/pdfs/resumes/${encodePathSegment(name)}`;
  }

  // Infer filename from id: `resume-<stem>` → `<stem>.pdf` (matches CSV numeric IDs)
  const stem = resumeId.startsWith('resume-') ? resumeId.slice('resume-'.length) : resumeId;
  const fileName = stem.endsWith('.pdf') ? stem : `${stem}.pdf`;

  if (category) {
    return `/pdfs/resumes/${encodePathSegment(category)}/${encodePathSegment(fileName)}`;
  }

  return `/pdfs/resumes/${encodePathSegment(fileName)}`;
}

function encodePathSegment(segment: string): string {
  return encodeURIComponent(segment);
}

/**
 * Update resume data with PDF URLs
 */
export function addPdfUrlsToResumes(resumes: SearchResultItem[]): SearchResultItem[] {
  return resumes.map((resume) => {
    let category: string | undefined = resume.category;
    let pureId = resume.id;

    if (resume.category) {
      category = resume.category;
    } else if (resume.id?.includes('/')) {
      const parts = resume.id.split('/');
      category = parts[0];
      pureId = parts[1] ?? resume.id;
    }

    return {
      ...resume,
      pdfUrl: getResumePdfUrl(pureId, category, {
        pdfUrl: resume.pdfUrl,
        pdfFilename: resume.pdfFilename,
      }),
    };
  });
}

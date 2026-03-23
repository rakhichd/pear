"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MagnifyingGlassIcon, ArrowTopRightOnSquareIcon, DocumentTextIcon, TagIcon, ArrowLongRightIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import type { SearchResultItem } from "@/types";

export default function SimpleSearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  /** Avoid double-fetch when handleSearch updates the URL and searchParams re-run the effect */
  const lastFetchedQ = useRef<string | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setError("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchQuery: trimmed,
          filters: {},
          page: 1,
          pageSize: 20,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(
          (errorData as { error?: string }).error ||
            `Search request failed with status ${response.status}`,
        );
      }

      const data = await response.json();
      setResults(data.results || []);
      lastFetchedQ.current = trimmed;
    } catch (err: unknown) {
      console.error("Search error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to search resumes: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Keep results in sync when URL has ?q= (initial load, browser back/forward) */
  useEffect(() => {
    const q = searchParams?.get("q")?.trim() ?? "";
    if (!q) {
      lastFetchedQ.current = null;
      setResults([]);
      return;
    }

    setSearchQuery(q);

    if (lastFetchedQ.current === q) {
      return;
    }

    void fetchResults(q);
  }, [searchParams, fetchResults]);

  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setError("Please enter a search query");
      return;
    }

    await fetchResults(trimmed);

    const params = new URLSearchParams();
    params.set("q", trimmed);
    const next = `${pathname}?${params.toString()}`;
    router.replace(next, { scroll: false });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      void handleSearch();
    }
  };

  const viewResume = (resume: SearchResultItem) => {
    const cat = resume.category || resume.metadata?.category;
    const q = cat ? `?category=${encodeURIComponent(cat)}` : "";
    router.push(`/resume/${resume.id}${q}`);
  };

  const extractSkills = (resume: SearchResultItem): string[] => {
    if (resume.skills && Array.isArray(resume.skills)) {
      return resume.skills;
    }

    const content = resume.content || resume.metadata?.content || "";
    if (content) {
      const commonSkills = ["JavaScript", "Python", "Java", "React", "SQL", "AWS", "Node.js"];
      return commonSkills.filter((skill) => content.toLowerCase().includes(skill.toLowerCase()));
    }

    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            ResumeFind
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 ml-4" />
            <input
              type="text"
              placeholder="Search by role, skills, company, background..."
              className="flex-1 px-4 py-3 focus:outline-none text-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              type="button"
              className="bg-indigo-600 text-white px-6 py-3 font-medium hover:bg-indigo-700 transition"
              onClick={() => void handleSearch()}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-xs text-gray-500 mt-1">
                Try searching for another term or refreshing the page.
              </p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">
            {isLoading
              ? "Searching..."
              : results.length > 0
                ? `Found ${results.length} matching resumes`
                : "Enter a search query to find resumes"}
          </h2>

          <div className="space-y-4">
            {results.map((resume) => {
              const skills = extractSkills(resume);
              return (
                <div
                  key={resume.id}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-indigo-600">
                      {resume.title || resume.metadata?.title || "Untitled Resume"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => viewResume(resume)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="View full resume"
                      >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 items-center text-sm text-gray-600">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span className="font-medium">
                      {resume.category || resume.metadata?.category || "General"}
                    </span>

                    {resume.source && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>{resume.source}</span>
                      </>
                    )}

                    {resume.id && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-xs">{resume.id}</span>
                      </>
                    )}
                  </div>

                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1 items-center">
                      <TagIcon className="h-4 w-4 text-gray-500" />
                      {skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {(resume.content || resume.metadata?.content) && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {(resume.content || resume.metadata?.content || "").substring(0, 300)}...
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => viewResume(resume)}
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                      View Resume PDF
                      <ArrowLongRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              );
            })}

            {results.length === 0 && !isLoading && searchQuery.trim() && (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-600 mb-2">No resumes found matching your search criteria.</p>
                <p className="text-gray-500 text-sm">Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Source {
  id: number;
  name: string;
  url: string;
  publishedAt: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  perspectives: {
    for: string[];
    against: string[];
    neutral: string[];
  };
  sources: Source[];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use AbortController to prevent race conditions
    const abortController = new AbortController();

    const searchArticles = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      console.log('[SEARCH] Starting search for:', query);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to search articles');
        }

        const data = await response.json();

        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          console.log('[SEARCH] Received response:', data);
          setArticle(data.article || null);
          setLoading(false);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('[SEARCH] Request aborted');
          return;
        }
        if (!abortController.signal.aborted) {
          setError('Failed to search articles. Please try again.');
          console.error('[SEARCH] Error:', err);
          setLoading(false);
        }
      }
    };

    searchArticles();

    // Cleanup: abort request if component unmounts or query changes
    return () => {
      console.log('[SEARCH] Aborting previous request');
      abortController.abort();
    };
  }, [query]); // Only depend on query

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="bg-[#f5f4f0] border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Link href="/" className="text-5xl font-light tracking-tight text-stone-900 hover:text-stone-700 transition-colors">
            Unbiased.
          </Link>
          <p className="text-stone-600 mt-3 font-light text-lg">Search results for "{query}"</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
            <p className="mt-4 text-stone-600 font-light">Searching for news articles...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-rose-600 font-light">{error}</p>
            <Link 
              href="/" 
              className="mt-4 inline-block text-stone-700 hover:text-stone-900 font-light underline"
            >
              Return to homepage
            </Link>
          </div>
        )}

        {!loading && !error && !article && (
          <div className="text-center py-12">
            <p className="text-stone-600 font-light">No results found for "{query}"</p>
            <Link
              href="/"
              className="mt-4 inline-block text-stone-700 hover:text-stone-900 font-light underline"
            >
              Return to homepage
            </Link>
          </div>
        )}

        {!loading && !error && article && (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-light text-stone-900 mb-2">
                Analysis Results
              </h2>
              <p className="text-stone-600 font-light">Multiple perspectives on "{query}"</p>
            </div>

            <div className="block bg-[#fefdfb] border border-stone-200 rounded-3xl p-10 shadow-sm">
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1 space-y-5">
                  <h2 className="text-3xl font-light text-stone-900 leading-tight">
                    {article.title}
                  </h2>
                  <p className="text-stone-600 text-lg font-light leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-stone-150">
                    <div className="space-y-3 p-4 bg-rose-50/30 rounded-xl border border-rose-100/50">
                      <h4 className="text-xs font-semibold text-rose-700 uppercase tracking-wider">For</h4>
                      {article.perspectives.for.length > 0 ? (
                        <ul className="space-y-2 list-disc list-inside text-sm text-stone-700 font-light leading-relaxed">
                          {article.perspectives.for.map((point, idx) => (
                            <li key={idx} className="pl-1">{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-stone-500 italic">No supporting points found</p>
                      )}
                    </div>
                    <div className="space-y-3 p-4 bg-amber-50/30 rounded-xl border border-amber-100/50">
                      <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Unbiased</h4>
                      {article.perspectives.neutral.length > 0 ? (
                        <ul className="space-y-2 list-disc list-inside text-sm text-stone-700 font-light leading-relaxed">
                          {article.perspectives.neutral.map((point, idx) => (
                            <li key={idx} className="pl-1">{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-stone-500 italic">No neutral facts found</p>
                      )}
                    </div>
                    <div className="space-y-3 p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                      <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Against</h4>
                      {article.perspectives.against.length > 0 ? (
                        <ul className="space-y-2 list-disc list-inside text-sm text-stone-700 font-light leading-relaxed">
                          {article.perspectives.against.map((point, idx) => (
                            <li key={idx} className="pl-1">{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-stone-500 italic">No opposing points found</p>
                      )}
                    </div>
                  </div>

                  {article.sources && article.sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-stone-200">
                      <h3 className="text-lg font-light text-stone-900 mb-4">Sources</h3>
                      <ul className="space-y-2">
                        {article.sources.map((source) => (
                          <li key={source.id} className="text-sm text-stone-600 font-light">
                            <span className="font-medium text-stone-700">[{source.id}]</span>{' '}
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-stone-900 underline"
                            >
                              {source.name}
                            </a>
                            {source.publishedAt && (
                              <span className="text-stone-500 ml-2">
                                ({new Date(source.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center pt-8">
              <Link
                href="/"
                className="inline-block text-stone-700 hover:text-stone-900 font-light underline"
              >
                Return to featured stories
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
          <p className="mt-4 text-stone-600 font-light">Loading search...</p>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
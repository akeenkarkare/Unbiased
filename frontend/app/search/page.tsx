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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsHeaderVisible(false);
      } else {
        // Scrolling up
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    <div className="min-h-screen bg-yellow-100">
      <header className={`bg-purple-400 border-b-4 border-black sticky top-0 z-50 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="flex items-center gap-2 bg-orange-300 px-4 py-2 border-4 border-black neo-shadow-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-black text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </Link>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-black uppercase transform -rotate-1">Unbiased</h1>
            </div>
          </div>

          <div className="mt-6">
            <form onSubmit={(e) => { e.preventDefault(); if (query) window.location.href = `/search?q=${encodeURIComponent(query)}`; }} className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Search news with AI..."
                defaultValue={query}
                onChange={(e) => {
                  const newQuery = e.target.value;
                  if (newQuery && newQuery !== query) {
                    const timer = setTimeout(() => {
                      window.location.href = `/search?q=${encodeURIComponent(newQuery)}`;
                    }, 1000);
                    return () => clearTimeout(timer);
                  }
                }}
                className="w-full px-6 py-4 bg-white border-4 border-black font-bold text-black placeholder-stone-500 focus:outline-none neo-shadow"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
            <p className="text-black mt-3 text-base font-bold">Showing results for "{query}"</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading && (
          <div className="text-center py-12">
            <div className="text-black font-black text-4xl uppercase animate-pulse">Searching...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-black font-black text-2xl uppercase mb-4">{error}</p>
            <Link
              href="/"
              className="inline-block bg-purple-400 text-black border-4 border-black px-6 py-3 font-black uppercase neo-shadow hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Return to homepage
            </Link>
          </div>
        )}

        {!loading && !error && !article && (
          <div className="text-center py-12">
            <p className="text-black font-black text-2xl uppercase mb-4">No results found for "{query}"</p>
            <Link
              href="/"
              className="inline-block bg-purple-400 text-black border-4 border-black px-6 py-3 font-black uppercase neo-shadow hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Return to homepage
            </Link>
          </div>
        )}

        {!loading && !error && article && (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-4xl font-black text-black uppercase mb-3 transform -rotate-1">
                Analysis Results
              </h2>
              <p className="text-black font-bold text-lg">Multiple perspectives on "{query}"</p>
            </div>

            <div className="block bg-white border-4 border-black p-10 neo-shadow-lg">
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <h2 className="text-4xl font-black text-black uppercase leading-tight">
                    {article.title}
                  </h2>
                  <p className="text-black text-lg font-bold leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t-4 border-black">
                    <div className="bg-purple-300 border-4 border-black p-5 neo-shadow-purple hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                      <h4 className="text-base font-black text-black uppercase tracking-tight mb-3">● For</h4>
                      {article.perspectives.for.length > 0 ? (
                        <ul className="space-y-2 list-disc list-inside text-black font-bold leading-snug">
                          {article.perspectives.for.map((point, idx) => (
                            <li key={idx} className="pl-1">{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-black font-bold">No supporting points found</p>
                      )}
                    </div>
                    <div className="bg-stone-200 border-4 border-black p-5 neo-shadow-gray hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                      <h4 className="text-base font-black text-black uppercase tracking-tight mb-3">● Unbiased</h4>
                      {article.perspectives.neutral.length > 0 ? (
                        <ul className="space-y-2 list-disc list-inside text-black font-bold leading-snug">
                          {article.perspectives.neutral.map((point, idx) => (
                            <li key={idx} className="pl-1">{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-black font-bold">No neutral facts found</p>
                      )}
                    </div>
                    <div className="bg-orange-300 border-4 border-black p-5 neo-shadow-orange hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                      <h4 className="text-base font-black text-black uppercase tracking-tight mb-3">● Against</h4>
                      {article.perspectives.against.length > 0 ? (
                        <ul className="space-y-2 list-disc list-inside text-black font-bold leading-snug">
                          {article.perspectives.against.map((point, idx) => (
                            <li key={idx} className="pl-1">{point}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-black font-bold">No opposing points found</p>
                      )}
                    </div>
                  </div>

                  {article.sources && article.sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t-4 border-black">
                      <h3 className="text-2xl font-black text-black uppercase mb-4">Sources</h3>
                      <ul className="space-y-3">
                        {article.sources.map((source) => (
                          <li key={source.id} className="text-base text-black font-bold">
                            <span className="bg-yellow-300 px-2 py-1 border-2 border-black">[{source.id}]</span>{' '}
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:bg-yellow-300 underline"
                            >
                              {source.name}
                            </a>
                            {source.publishedAt && (
                              <span className="ml-2">
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
                className="inline-block bg-purple-400 text-black border-4 border-black px-8 py-4 font-black uppercase neo-shadow hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
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
      <div className="min-h-screen bg-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-black font-black text-4xl uppercase animate-pulse">Loading search...</div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
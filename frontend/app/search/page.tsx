'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  perspectives?: {
    for: string;
    against: string;
    neutral: string;
  };
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      searchArticles(query);
    }
  }, [query]);

  const searchArticles = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Failed to search articles');
      }

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err) {
      setError('Failed to search articles. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

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

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-600 font-light">No articles found for "{query}"</p>
            <Link 
              href="/" 
              className="mt-4 inline-block text-stone-700 hover:text-stone-900 font-light underline"
            >
              Return to homepage
            </Link>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-light text-stone-900 mb-2">
                Found {articles.length} article{articles.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-stone-600 font-light">Multiple perspectives on "{query}"</p>
            </div>

            {articles.map((article) => (
              <div
                key={article.id}
                className="block bg-[#fefdfb] border border-stone-200 rounded-3xl p-10 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-8">
                  <div className="flex-1 space-y-5">
                    <h2 className="text-3xl font-light text-stone-900 leading-tight">
                      {article.title}
                    </h2>
                    <p className="text-stone-600 text-lg font-light leading-relaxed">
                      {article.summary}
                    </p>

                    {article.perspectives && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-stone-150">
                        <div className="space-y-2 p-4 bg-rose-50/30 rounded-xl border border-rose-100/50">
                          <h4 className="text-xs font-semibold text-rose-700 uppercase tracking-wider">For</h4>
                          <p className="text-sm text-stone-700 font-light leading-relaxed">{article.perspectives.for}</p>
                        </div>
                        <div className="space-y-2 p-4 bg-amber-50/30 rounded-xl border border-amber-100/50">
                          <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Unbiased</h4>
                          <p className="text-sm text-stone-700 font-light leading-relaxed">{article.perspectives.neutral}</p>
                        </div>
                        <div className="space-y-2 p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                          <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Against</h4>
                          <p className="text-sm text-stone-700 font-light leading-relaxed">{article.perspectives.against}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-stone-500 font-light pt-3">
                      <span className="text-stone-700 font-medium">{article.source}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                      <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

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
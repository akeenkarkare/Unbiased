'use client';

import Link from "next/link";
import { mockArticles } from "@/lib/data";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCommentCount } from "@/lib/supabaseHelpers";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const timeoutId = setTimeout(() => {
      setError('Taking longer than expected to load articles. Please refresh the page.');
      setLoading(false);
    }, 15000); // 15 second timeout

    try {
      const response = await fetch('/api/articles');

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);

        // Fetch comment counts for each article
        const counts: Record<string, number> = {};
        await Promise.all(
          data.articles.map(async (article: any) => {
            counts[article.id] = await getCommentCount(article.id);
          })
        );
        setCommentCounts(counts);
      } else {
        setError('No articles found. Please try again later.');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching articles:', error);
      setError('Error loading articles. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Sort articles by comment count (from commentCounts), fallback to engagement score
  const sortedArticles = [...articles].sort((a, b) => {
    const aComments = commentCounts[a.id] || 0;
    const bComments = commentCounts[b.id] || 0;

    // Primary sort: by comment count (descending)
    if (bComments !== aComments) {
      return bComments - aComments;
    }

    // Secondary sort: by engagement score (descending)
    return (b.engagementScore || 0) - (a.engagementScore || 0);
  });

  return (
    <div className="min-h-screen bg-yellow-100">
      <header className="bg-purple-400 border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-4 mb-3">
            <img src="/Overlapping Speech Bubbles in Vibrant Tones.png" alt="Unbiased Logo" className="w-16 h-16 border-4 border-black neo-shadow-sm" />
            <h1 className="text-6xl font-black tracking-tighter text-black uppercase transform -rotate-1">Unbiased</h1>
          </div>
          <p className="text-black mt-3 font-bold text-xl">All sides. Your judgment.</p>
          <p className="text-black mt-1 text-lg font-bold">Three angles. One clear view.</p>

          <div className="mt-8">
            <form onSubmit={handleSearch} className="relative max-w-xl">
              <input
                type="text"
                placeholder="Search news with AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-white border-4 border-black font-bold text-black placeholder-stone-500 focus:outline-none focus:translate-x-1 focus:translate-y-1 neo-shadow transition-transform"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:scale-125 transition-transform font-black"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
            <p className="mt-4 text-stone-600 font-light">Loading articles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-rose-600 font-light">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-stone-800 text-stone-50 rounded-xl font-light hover:bg-stone-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-600 font-light">No articles available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedArticles.map((article, idx) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group block bg-white border-4 border-black transition-all duration-200 p-8 neo-shadow-lg hover:translate-x-[8px] hover:translate-y-[8px] active:translate-x-[8px] active:translate-y-[8px]"
            >
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1 space-y-5">
                  <h2 className="text-4xl font-black text-black uppercase leading-tight tracking-tight">
                    {article.title}
                  </h2>
                  <p className="text-black text-lg font-bold leading-relaxed">
                    {article.summary}
                  </p>

                  {article.perspectives && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t-4 border-black">
                      <div className="bg-purple-300 border-4 border-black p-5 neo-shadow-purple transition-all cursor-pointer hover:!translate-x-[6px] hover:!translate-y-[6px]">
                        <h4 className="text-base font-black text-black uppercase tracking-tight mb-3">
                          ● For
                        </h4>
                        <p className="text-black font-bold leading-snug">{article.perspectives.for}</p>
                      </div>
                      <div className="bg-stone-200 border-4 border-black p-5 neo-shadow-gray transition-all cursor-pointer hover:!translate-x-[6px] hover:!translate-y-[6px]">
                        <h4 className="text-base font-black text-black uppercase tracking-tight mb-3">
                          ● Unbiased
                        </h4>
                        <p className="text-black font-bold leading-snug">{article.perspectives.neutral}</p>
                      </div>
                      <div className="bg-orange-300 border-4 border-black p-5 neo-shadow-orange transition-all cursor-pointer hover:!translate-x-[6px] hover:!translate-y-[6px]">
                        <h4 className="text-base font-black text-black uppercase tracking-tight mb-3">
                          ● Against
                        </h4>
                        <p className="text-black font-bold leading-snug">{article.perspectives.against}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-base font-black pt-4">
                    <span className="text-black bg-yellow-300 px-3 py-1 border-2 border-black">{article.source}</span>
                    <span className="text-black">●</span>
                    <span className="text-black">{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-black">●</span>
                    <span className="text-black">{commentCounts[article.id] || 0} comments</span>
                  </div>
                </div>
              </div>
            </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

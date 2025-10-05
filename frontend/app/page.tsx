'use client';

import Link from "next/link";
import { mockArticles } from "@/lib/data";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCommentCount } from "@/lib/supabaseHelpers";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState(mockArticles);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
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
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Fall back to mock articles on error
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

  const sortedArticles = [...articles].sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="bg-[#f5f4f0] border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-light tracking-tight text-stone-900">Unbiased</h1>
          <p className="text-stone-600 mt-2 font-light">All sides. Your judgment.</p>
          <p className="text-stone-500 mt-1 text-sm font-light">Three angles. One clear view.</p>

          <div className="mt-6">
            <form onSubmit={handleSearch} className="relative max-w-md">
              <input
                type="text"
                placeholder="Search news with AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {sortedArticles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group block bg-[#fefdfb] border border-stone-200 rounded-2xl hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300 p-8"
            >
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <h2 className="text-2xl font-light text-stone-900 group-hover:text-stone-700 transition-colors leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-stone-600 text-base font-light leading-relaxed">
                    {article.summary}
                  </p>

                  {article.perspectives && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-stone-100">
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-rose-700 uppercase tracking-wide">For</h4>
                        <p className="text-sm text-stone-600 font-light leading-relaxed">{article.perspectives.for}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-amber-700 uppercase tracking-wide">Unbiased</h4>
                        <p className="text-sm text-stone-600 font-light leading-relaxed">{article.perspectives.neutral}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Against</h4>
                        <p className="text-sm text-stone-600 font-light leading-relaxed">{article.perspectives.against}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-stone-500 font-light pt-2">
                    <span className="text-stone-700">{article.source}</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                    <span>{commentCounts[article.id] || 0} comments</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

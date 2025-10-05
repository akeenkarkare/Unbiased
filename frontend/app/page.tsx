'use client';

import Link from "next/link";
import { mockArticles } from "@/lib/data";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const featuredArticle = mockArticles
    .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))[0];

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="bg-[#f5f4f0] border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-5xl font-light tracking-tight text-stone-900">Unbiased.</h1>
          <p className="text-stone-600 mt-3 font-light text-lg">All sides. Your judgment.</p>
          <p className="text-stone-500 mt-1 text-sm font-light">Three angles. One clear view.</p>

          <div className="mt-8">
            <form onSubmit={handleSearch} className="relative max-w-xl">
              <input
                type="text"
                placeholder="Search news with AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-stone-200 rounded-2xl font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent shadow-sm transition-shadow hover:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-stone-900 mb-2">Featured Story</h2>
          <p className="text-stone-600 font-light">Today's most engaging discussion</p>
        </div>
        
        {featuredArticle && (
          <Link
            href={`/article/${featuredArticle.id}`}
            className="group block bg-[#fefdfb] border border-stone-200 rounded-3xl hover:border-stone-300 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 p-10"
          >
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1 space-y-5">
                <h2 className="text-3xl font-light text-stone-900 group-hover:text-stone-700 transition-colors leading-tight">
                  {featuredArticle.title}
                </h2>
                <p className="text-stone-600 text-lg font-light leading-relaxed">
                  {featuredArticle.summary}
                </p>

                {featuredArticle.perspectives && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-stone-150">
                    <div className="space-y-2 p-4 bg-rose-50/30 rounded-xl border border-rose-100/50">
                      <h4 className="text-xs font-semibold text-rose-700 uppercase tracking-wider">For</h4>
                      <p className="text-sm text-stone-700 font-light leading-relaxed">{featuredArticle.perspectives.for}</p>
                    </div>
                    <div className="space-y-2 p-4 bg-amber-50/30 rounded-xl border border-amber-100/50">
                      <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Unbiased</h4>
                      <p className="text-sm text-stone-700 font-light leading-relaxed">{featuredArticle.perspectives.neutral}</p>
                    </div>
                    <div className="space-y-2 p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                      <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Against</h4>
                      <p className="text-sm text-stone-700 font-light leading-relaxed">{featuredArticle.perspectives.against}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-stone-500 font-light pt-3">
                  <span className="text-stone-700 font-medium">{featuredArticle.source}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                  <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {featuredArticle.engagementScore && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                      <span>{featuredArticle.engagementScore} comments</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}
      </main>
    </div>
  );
}

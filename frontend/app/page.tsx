'use client';

import Link from "next/link";
import { mockArticles } from "@/lib/data";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = mockArticles
    .filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
    .slice(0, 25);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="bg-[#f5f4f0] border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-light tracking-tight text-stone-900">Unbiased</h1>
          <p className="text-stone-600 mt-2 font-light">All sides. Your judgment.</p>
          <p className="text-stone-500 mt-1 text-sm font-light">Three angles. One clear view.</p>
          
          <div className="mt-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-light text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-stone-900 mb-2">Featured Stories</h2>
          <p className="text-stone-600 font-light">Today's most engaging discussions</p>
        </div>
        
        <div className="space-y-6">
          {filteredArticles.map((article) => (
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
                    {article.engagementScore && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                        <span>{article.engagementScore} comments</span>
                      </>
                    )}
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

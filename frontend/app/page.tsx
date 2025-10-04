import Link from "next/link";
import { mockArticles } from "@/lib/data";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Unbiased News</h1>
          <p className="text-gray-600 mt-1">Clear, balanced perspectives on today's stories</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {mockArticles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">{article.summary}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{article.publishedAt}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {article.biasPercentage}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Bias</div>
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

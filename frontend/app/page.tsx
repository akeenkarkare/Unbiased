import Link from "next/link";
import { mockArticles } from "@/lib/data";

function getBiasColor(bias: number) {
  if (bias < 20) return "text-emerald-700";
  if (bias < 40) return "text-amber-700";
  return "text-rose-700";
}

function getBiasBgColor(bias: number) {
  if (bias < 20) return "bg-emerald-50";
  if (bias < 40) return "bg-amber-50";
  return "bg-rose-50";
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="bg-[#f5f4f0] border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-light tracking-tight text-stone-900">Unbiased</h1>
          <p className="text-stone-600 mt-2 font-light">Clear, balanced perspectives on today's stories</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {mockArticles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group block bg-[#fefdfb] border border-stone-200 rounded-2xl hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300 p-8"
            >
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1 space-y-3">
                  <h2 className="text-2xl font-light text-stone-900 group-hover:text-stone-700 transition-colors leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-stone-600 text-base font-light leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-stone-500 font-light pt-2">
                    <span className="text-stone-700">{article.source}</span>
                    <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className={`${getBiasBgColor(article.biasPercentage)} rounded-xl px-6 py-4 text-center border border-stone-200`}>
                    <div className={`text-3xl font-light ${getBiasColor(article.biasPercentage)}`}>
                      {article.biasPercentage}%
                    </div>
                    <div className="text-xs text-stone-600 mt-1 font-light tracking-wide">BIAS</div>
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

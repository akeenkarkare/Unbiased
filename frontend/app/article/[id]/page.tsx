"use client";

import { use, useState } from "react";
import Link from "next/link";
import { mockArticles, mockComments, mockCommentsSummary } from "@/lib/data";

export default function ArticlePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: { fromSearch?: string } }) {
  const { id } = use(params);
  const isFromSearch = searchParams?.fromSearch === 'true';
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState(mockComments[id] || []);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");

  const article = mockArticles.find((a) => a.id === id);
  const commentsSummary = mockCommentsSummary[id];

  // Only show comments for homepage articles, not search results
  const showComments = !isFromSearch;

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
        <div className="text-center">
          <h1 className="text-2xl font-light text-stone-900">Article not found</h1>
          <Link href="/" className="text-stone-600 hover:text-stone-900 mt-4 block font-light">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !authorName.trim()) return;

    const comment = {
      id: `c${Date.now()}`,
      articleId: id,
      author: authorName,
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, comment]);
    setNewComment("");
    setAuthorName("");
  };

  const handleSwipe = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const swipeDistance = touch.clientX - (e.target as HTMLElement).getBoundingClientRect().left;

    if (swipeDistance > 100) {
      setIsCommentsOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="bg-[#f5f4f0] border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors font-light">
            ← Back
          </Link>
          <h1 className="text-xl font-light tracking-tight text-stone-900">Unbiased</h1>
        </div>
      </header>

      {/* Main Layout: Article + Comments Side by Side */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">
          {/* Article Content */}
          <main className="flex-1" onTouchEnd={handleSwipe}>
            <article className="bg-[#fefdfb] border border-stone-200 rounded-2xl p-10">
              <div className="mb-8">
                <div className="mb-6">
                  <h1 className="text-4xl font-light text-stone-900 leading-tight">
                    {article.title}
                  </h1>
                </div>

                <div className="flex items-center gap-4 text-sm text-stone-500 font-light">
                  <span className="text-stone-700">{article.source}</span>
                  <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                  <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="prose prose-stone max-w-none">
                <p className="text-lg text-stone-700 leading-relaxed font-light">
                  {article.content}
                </p>
              </div>

              {/* Mobile: Show Comments Button - Only for homepage articles */}
              {showComments && (
                <button
                  onClick={() => setIsCommentsOpen(true)}
                  className="lg:hidden mt-8 w-full bg-stone-800 text-stone-50 py-3 rounded-xl font-light hover:bg-stone-700 transition-colors"
                >
                  View Comments ({comments.length})
                </button>
              )}
            </article>
          </main>

          {/* Desktop: Comments on Right Side - Only for homepage articles */}
          {showComments && (
            <aside className="hidden lg:block w-96 sticky top-24">
              <CommentsSection
                comments={comments}
                commentsSummary={commentsSummary}
                newComment={newComment}
                setNewComment={setNewComment}
                authorName={authorName}
                setAuthorName={setAuthorName}
                handleAddComment={handleAddComment}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Mobile: Sliding Comments Panel - Only for homepage articles */}
      {showComments && (
        <div
          className={`fixed inset-y-0 right-0 w-full bg-[#fafaf9] z-50 transform transition-transform duration-300 lg:hidden ${
            isCommentsOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="bg-[#f5f4f0] border-b border-stone-200 px-6 py-6 flex items-center justify-between">
              <h2 className="text-xl font-light text-stone-900">Comments</h2>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="text-stone-500 hover:text-stone-900 text-2xl font-light"
              >
                ×
              </button>
            </div>

            <CommentsSection
              comments={comments}
              commentsSummary={commentsSummary}
              newComment={newComment}
              setNewComment={setNewComment}
              authorName={authorName}
              setAuthorName={setAuthorName}
              handleAddComment={handleAddComment}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CommentsSection({
  comments,
  commentsSummary,
  newComment,
  setNewComment,
  authorName,
  setAuthorName,
  handleAddComment,
}: {
  comments: any[];
  commentsSummary?: string;
  newComment: string;
  setNewComment: (value: string) => void;
  authorName: string;
  setAuthorName: (value: string) => void;
  handleAddComment: () => void;
}) {
  return (
    <div className="flex flex-col h-full lg:h-[calc(100vh-8rem)] bg-[#fefdfb] border border-stone-200 rounded-2xl overflow-hidden">
      {/* AI Summary */}
      {commentsSummary && (
        <div className="bg-amber-50/50 border-b border-stone-200 p-6">
          <h3 className="font-light text-stone-900 mb-3 flex items-center gap-2 text-sm tracking-wide">
            <span>✨</span> AI SUMMARY
          </h3>
          <p className="text-stone-700 text-sm font-light leading-relaxed">{commentsSummary}</p>
        </div>
      )}

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-stone-500 text-center py-12 font-light">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-stone-50/50 rounded-xl p-5 border border-stone-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-light text-stone-900">
                    {comment.author}
                  </span>
                  <span className="text-xs text-stone-500 font-light">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-stone-700 font-light leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="border-t border-stone-200 bg-[#fefdfb] p-6">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent font-light text-stone-900 placeholder:text-stone-400"
          />
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent resize-none font-light text-stone-900 placeholder:text-stone-400"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || !authorName.trim()}
            className="w-full bg-stone-800 text-stone-50 py-3 rounded-xl font-light hover:bg-stone-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}

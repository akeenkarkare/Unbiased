"use client";

import { use, useState } from "react";
import Link from "next/link";
import { mockArticles, mockComments, mockCommentsSummary } from "@/lib/data";

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState(mockComments[id] || []);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");

  const article = mockArticles.find((a) => a.id === id);
  const commentsSummary = mockCommentsSummary[id];

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Article not found</h1>
          <Link href="/" className="text-blue-600 hover:underline mt-4 block">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Unbiased News</h1>
        </div>
      </header>

      {/* Main Article */}
      <main
        className="max-w-4xl mx-auto px-4 py-8"
        onTouchEnd={handleSwipe}
      >
        <article className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{article.source}</span>
                <span>•</span>
                <span>{article.publishedAt}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-center bg-blue-50 rounded-lg p-3">
                <div className="text-3xl font-bold text-blue-600">
                  {article.biasPercentage}%
                </div>
                <div className="text-xs text-gray-600 mt-1">Bias Score</div>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed">
              {article.content}
            </p>
          </div>

          {/* Mobile: Show Comments Button */}
          <button
            onClick={() => setIsCommentsOpen(true)}
            className="md:hidden mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Comments ({comments.length})
          </button>
        </article>

        {/* Desktop: Show Comments Below */}
        <div className="hidden md:block mt-8">
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
      </main>

      {/* Mobile: Sliding Comments Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full bg-white z-50 transform transition-transform duration-300 md:hidden ${
          isCommentsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="bg-white border-b px-4 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Comments</h2>
            <button
              onClick={() => setIsCommentsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
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
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* AI Summary */}
      {commentsSummary && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-4 mt-4 rounded">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <span>🤖</span> AI Summary
          </h3>
          <p className="text-blue-800 text-sm">{commentsSummary}</p>
        </div>
      )}

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    {comment.author}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="border-t bg-white p-4">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || !authorName.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}

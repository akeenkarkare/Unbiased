"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { mockArticles, mockCommentsSummary } from "@/lib/data";
import { getCommentsForArticle, addComment } from "@/lib/supabaseHelpers";

export default function ArticlePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: Promise<{ fromSearch?: string }> }) {
  const { id } = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const isFromSearch = resolvedSearchParams.fromSearch === 'true';
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const commentsSummary = undefined; // TODO: Generate AI summary

  // Only show comments for homepage articles, not search results
  const showComments = !isFromSearch;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch article from API
        const articleResponse = await fetch(`/api/articles/${id}`);
        if (articleResponse.ok) {
          const articleData = await articleResponse.json();
          setArticle(articleData.article);
        } else {
          // Fallback to mock data
          setArticle(mockArticles.find((a) => a.id === id));
        }

        // Fetch comments from Supabase
        if (!isFromSearch) {
          const commentsData = await getCommentsForArticle(id);
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setArticle(mockArticles.find((a) => a.id === id));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isFromSearch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-100">
        <div className="text-black font-black text-4xl uppercase animate-pulse">Loading...</div>
      </div>
    );
  }

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

  const handleAddComment = async () => {
    if (!newComment.trim() || !authorName.trim()) return;

    try {
      const comment = await addComment(id, authorName, newComment);
      setComments([...comments, comment]);
      setNewComment("");
      setAuthorName("");
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleSwipe = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const swipeDistance = touch.clientX - (e.target as HTMLElement).getBoundingClientRect().left;

    if (swipeDistance > 100) {
      setIsCommentsOpen(true);
    }
  };

  const handleGenerateAudio = async () => {
    if (isGeneratingAudio || !article) return;

    setIsGeneratingAudio(true);
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${article.title}. ${article.content}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-100">
      {/* Header */}
      <header className="border-b-4 border-black sticky top-0 z-10 bg-purple-400">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center gap-4">
          <Link href="/" className="text-black font-black flex items-center gap-2 bg-orange-300 px-4 py-2 border-4 border-black neo-shadow-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:shadow-none active:translate-x-1 active:translate-y-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase transform -rotate-1">Unbiased.</h1>
        </div>
      </header>

      {/* Main Layout: Article + Comments Side by Side */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">
          {/* Article Content */}
          <main className="flex-1" onTouchEnd={handleSwipe}>
            <article className="bg-white border-4 border-black p-12 neo-shadow-lg">
              <div className="mb-10">
                <div className="mb-6">
                  <h1 className="text-5xl font-black text-black leading-tight tracking-tight uppercase">
                    {article.title}
                  </h1>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-base font-black">
                    <span className="text-black bg-yellow-300 px-3 py-1 border-2 border-black">{article.source}</span>
                    <span className="text-black">●</span>
                    <span className="text-black">{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {!article.audioUrl && (
                    <button
                      onClick={handleGenerateAudio}
                      disabled={isGeneratingAudio}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-400 text-black border-4 border-black font-black uppercase hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed neo-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={3}>
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 00-2.828 2.828M12 8v8m0 0l-3-3m3 3l3-3" />
                          </svg>
                          Listen
                        </>
                      )}
                    </button>
                  )}
                </div>

                {(article.audioUrl || audioUrl) && (
                  <div className="mt-6 p-6 bg-orange-200 border-4 border-black neo-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 00-2.828 2.828M12 8v8m0 0l-3-3m3 3l3-3" />
                      </svg>
                      <span className="text-base font-black text-black uppercase">Listen to this article</span>
                    </div>
                    <audio controls className="w-full">
                      <source src={article.audioUrl || audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>

              <div className="prose prose-stone max-w-none">
                <p className="text-xl text-black leading-relaxed font-bold">
                  {article.content}
                </p>
              </div>

              {/* Perspectives Section */}
              {article.perspectives && (
                <div className="mt-12 pt-8 border-t-4 border-black">
                  <h3 className="text-4xl font-black text-black uppercase mb-8 transform -rotate-1">Different Perspectives</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-purple-300 border-4 border-black p-6 neo-shadow-purple transition-all cursor-pointer hover:!translate-x-[6px] hover:!translate-y-[6px]">
                      <h4 className="text-lg font-black text-black uppercase tracking-tight mb-3">
                        ● For
                      </h4>
                      <p className="text-black font-bold leading-snug">{article.perspectives.for}</p>
                    </div>
                    <div className="bg-stone-200 border-4 border-black p-6 neo-shadow-gray transition-all cursor-pointer hover:!translate-x-[6px] hover:!translate-y-[6px]">
                      <h4 className="text-lg font-black text-black uppercase tracking-tight mb-3">
                        ● Unbiased
                      </h4>
                      <p className="text-black font-bold leading-snug">{article.perspectives.neutral}</p>
                    </div>
                    <div className="bg-orange-300 border-4 border-black p-6 neo-shadow-orange transition-all cursor-pointer hover:!translate-x-[6px] hover:!translate-y-[6px]">
                      <h4 className="text-lg font-black text-black uppercase tracking-tight mb-3">
                        ● Against
                      </h4>
                      <p className="text-black font-bold leading-snug">{article.perspectives.against}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile: Show Comments Button - Only for homepage articles */}
              {showComments && (
                <button
                  onClick={() => setIsCommentsOpen(true)}
                  className="lg:hidden mt-8 w-full bg-purple-400 text-black border-4 border-black py-4 font-black uppercase hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all neo-shadow active:shadow-none active:translate-x-1 active:translate-y-1"
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
          className={`fixed inset-y-0 right-0 w-full bg-yellow-100 z-50 transform transition-transform duration-300 lg:hidden ${
            isCommentsOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="bg-purple-400 border-b-4 border-black px-6 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-black uppercase">Comments</h2>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="text-black hover:scale-125 text-4xl font-black transition-transform"
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
    <div className="flex flex-col h-full lg:h-[calc(100vh-8rem)] bg-white border-4 border-black overflow-hidden neo-shadow-lg">
      {/* AI Summary */}
      {commentsSummary && (
        <div className="bg-yellow-200 border-b-4 border-black p-6">
          <h3 className="font-black text-black mb-3 flex items-center gap-2 text-base uppercase">
            <span>✨</span> AI SUMMARY
          </h3>
          <p className="text-black font-bold leading-relaxed">{commentsSummary}</p>
        </div>
      )}

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-black text-center py-12 font-bold">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-purple-100 border-3 border-black p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-black text-black">
                    {comment.author}
                  </span>
                  <span className="text-sm text-black font-bold">
                    {new Date(comment.created_at || comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-black font-bold leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="border-t-4 border-black bg-white p-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-4 py-3 bg-white border-4 border-black font-bold text-black placeholder:text-stone-500 focus:outline-none"
          />
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-white border-4 border-black resize-none font-bold text-black placeholder:text-stone-500 focus:outline-none"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || !authorName.trim()}
            className="w-full bg-purple-400 text-black border-4 border-black py-3 font-black uppercase hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed neo-shadow-sm active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}

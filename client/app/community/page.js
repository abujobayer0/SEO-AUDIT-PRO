"use client";

import { useEffect, useState } from "react";
import { communityApi } from "@/lib/api";
import ShinyText from "@/components/ShinyText";
import GradientBlinds from "@/components/GradientBlinds";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null); // {results, similar}
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [newPost, setNewPost] = useState({ title: "", content: "", authorName: "", tags: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = async (opts = {}) => {
    try {
      setLoading(true);
      const p = opts.page ?? page;
      const l = opts.limit ?? limit;
      const { posts, total, page: currentPage, limit: currentLimit } = await communityApi.listPosts({ page: p, limit: l });
      setPosts(posts || []);
      setTotal(total || 0);
      setPage(currentPage || 1);
      setLimit(currentLimit || l);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const runSearch = async (q, opts = {}) => {
    const term = (q ?? query).trim();
    if (!term) {
      setSearchResults(null);
      return;
    }
    try {
      setSearching(true);
      const p = opts.page ?? 1;
      const l = opts.limit ?? limit;
      const data = await communityApi.searchPosts({ q: term, page: p, limit: l });
      setSearchResults(data);
      setError("");
    } catch (e) {
      setError(e.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    setSubmitting(true);
    try {
      const payload = {
        title: newPost.title,
        content: newPost.content,
        authorName: newPost.authorName || undefined,
        tags: newPost.tags
          ? newPost.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };
      await communityApi.createPost(payload);
      setNewPost({ title: "", content: "", authorName: "", tags: "" });
      await loadPosts();
    } catch (e) {
      setError(e.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (postId, content, authorName) => {
    if (!content) return;
    try {
      await communityApi.addComment(postId, { content, authorName });
      await loadPosts();
    } catch (e) {
      setError(e.message || "Failed to add comment");
    }
  };

  const handleAddReply = async (postId, commentId, content, authorName) => {
    if (!content) return;
    try {
      await communityApi.addReply(postId, commentId, { content, authorName });
      await loadPosts();
    } catch (e) {
      setError(e.message || "Failed to add reply");
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-10'>
      <header className='bg-black/30 backdrop-blur-md w-full rounded-full shadow-xl border border-white/10 mb-6'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-3'>
            <Link href={"/"}>
              <div className='flex items-center'>
                <BarChart3 className='h-6 w-6 text-white' />
                <span className='ml-2 text-sm font-bold text-white'>SEO Audit Pro</span>
              </div>
            </Link>
            <button
              onClick={() => router.push("/")}
              className='px-3 py-1.5 rounded-full text-white border border-white/20 hover:border-white/50 transition-all text-sm'
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>
      <div className='relative overflow-hidden rounded-2xl border border-white/10 p-[1px] mb-10'>
        <div className='absolute inset-0  pointer-events-none'>
          <GradientBlinds
            gradientColors={["#FF9FFC", "#5227FF"]}
            angle={0}
            noise={0.3}
            blindCount={12}
            blindMinWidth={50}
            spotlightRadius={0.5}
            spotlightSoftness={1}
            spotlightOpacity={1}
            mouseDampening={0.15}
            distortAmount={0}
            shineDirection='left'
            mixBlendMode='lighten'
          />
        </div>
        <div className='relative rounded-2xl bg-black/40  px-6 py-10 md:px-10 md:py-14'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
            <div className='max-w-2xl'>
              <ShinyText text='Community' className='text-4xl md:text-5xl font-bold' />
              <p className='text-base md:text-lg text-gray-300 mt-3'>
                Share ideas, report issues, and collaborate with other makers using Audit Pro.
              </p>
              <div className='mt-6 flex items-center gap-3'>
                <button
                  onClick={() => document.getElementById("create-post")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className='px-4 py-2.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-sm font-medium border border-white/10'
                >
                  Start a discussion
                </button>
                <button
                  onClick={() => document.getElementById("community-feed")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className='px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10'
                >
                  Browse feed
                </button>
              </div>
            </div>
            <div className='hidden md:flex items-center gap-2 text-xs text-gray-300'>
              <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-400'></span> Open discussions
              </span>
              <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1'>
                Safe & respectful
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className='mt-8 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]'>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder='Search by title, content, tags, or author…'
              className='w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
            />
            <button
              onClick={() => runSearch()}
              disabled={searching}
              className='rounded-lg bg-indigo-600/90 hover:bg-indigo-500 transition text-white px-4 py-3 text-sm font-medium border border-white/10 disabled:opacity-60'
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <section id='community-feed' className='md:col-span-2'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-sm font-medium text-white/80'>{searchResults ? "Search results" : "Latest discussions"}</h2>
            <div className='text-xs text-gray-400'>
              {searchResults
                ? `${searchResults.total || 0} match${(searchResults.total || 0) === 1 ? "" : "es"}`
                : loading
                ? "Loading…"
                : `${total} post${total === 1 ? "" : "s"}`}
            </div>
          </div>

          {loading ? (
            <div className='text-sm text-gray-400'>Loading community posts...</div>
          ) : error ? (
            <div className='text-sm text-red-400'>{error}</div>
          ) : searchResults ? (
            <>
              {/* Results */}
              {(searchResults.results || []).length === 0 ? (
                <div className='text-sm text-gray-400'>No results for "{query}".</div>
              ) : (
                <ul className='space-y-5'>
                  {searchResults.results.map((post) => (
                    <SearchResultItem key={post._id} post={post} />
                  ))}
                </ul>
              )}

              {/* Search Pagination */}
              <Pagination
                page={searchResults.page || 1}
                totalPages={searchResults.totalPages || 1}
                onPageChange={(p) => runSearch(query, { page: p })}
              />

              {/* Similar */}
              {searchResults.similar?.length ? (
                <div className='mt-8'>
                  <h3 className='text-sm font-medium text-white/80 mb-3'>Similar discussions</h3>
                  <ul className='space-y-3'>
                    {searchResults.similar.map((p) => (
                      <li key={p._id} className='rounded-xl border border-white/10 bg-black/30 p-4'>
                        <div className='font-medium'>{p.title}</div>
                        <div className='text-xs text-gray-400'>{new Date(p.createdAt).toLocaleString()}</div>
                        <div className='text-sm text-gray-300 mt-2 line-clamp-2'>{p.content}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : posts.length === 0 ? (
            <div className='text-sm text-gray-400'>No posts yet. Be the first to start a discussion!</div>
          ) : (
            <>
              <ul className='space-y-5'>
                {posts.map((post) => (
                  <li key={post._id} className='relative overflow-hidden rounded-xl border border-white/10 p-[1px]'>
                    <div className='rounded-xl bg-white/[0.03] p-4 backdrop-blur-xl'>
                      <div className='flex items-start justify-between gap-3 mb-3'>
                        <div className='flex items-center gap-3'>
                          <div className='h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center text-sm font-semibold'>
                            {(post.authorName || post.author?.name || "A").slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <h3 className='font-semibold leading-tight'>{post.title}</h3>
                            <div className='text-xs text-gray-500'>{new Date(post.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 text-xs text-gray-400'>
                          <span className='inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1'>
                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' className='opacity-80'>
                              <path d='M12 4v16m8-8H4' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                            </svg>
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                      <p className='text-sm text-gray-200 whitespace-pre-wrap'>{post.content}</p>
                      {post.tags?.length ? (
                        <div className='mt-3 flex flex-wrap gap-2'>
                          {post.tags.map((t) => (
                            <span
                              key={t}
                              className='text-[10px] uppercase tracking-wide border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded-full'
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className='mt-5'>
                        <h4 className='text-sm font-medium mb-2'>Comments</h4>
                        <CommentSection post={post} onAddComment={handleAddComment} onAddReply={handleAddReply} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={page} totalPages={Math.max(1, Math.ceil(total / limit))} onPageChange={(p) => loadPosts({ page: p })} />
            </>
          )}
        </section>

        <aside id='create-post' className='md:col-span-1'>
          <div className='sticky top-24'>
            <div className='mb-4'>
              <h3 className='text-sm font-medium text-white/80'>Create a post</h3>
              <p className='text-xs text-gray-400'>Share an issue, idea, or question.</p>
            </div>
            <form onSubmit={handleCreate}>
              <div className='relative rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl'>
                <div className='grid grid-cols-1 gap-3'>
                  <input
                    value={newPost.title}
                    onChange={(e) => setNewPost((s) => ({ ...s, title: e.target.value }))}
                    placeholder='Post title'
                    className='w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                  />
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost((s) => ({ ...s, content: e.target.value }))}
                    placeholder='Write your post...'
                    rows={5}
                    className='w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                  />
                  <input
                    value={newPost.authorName}
                    onChange={(e) => setNewPost((s) => ({ ...s, authorName: e.target.value }))}
                    placeholder='Your name (if not logged in)'
                    className='w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                  />
                  <input
                    value={newPost.tags}
                    onChange={(e) => setNewPost((s) => ({ ...s, tags: e.target.value }))}
                    placeholder='Tags (comma separated)'
                    className='w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                  />
                  <button
                    type='submit'
                    disabled={submitting}
                    className='rounded-lg bg-indigo-600/90 hover:bg-indigo-500 transition text-white px-4 py-2.5 text-sm font-medium shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]'
                  >
                    {submitting ? "Posting…" : "Share post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SearchResultItem({ post }) {
  return (
    <li className='relative overflow-hidden rounded-xl border border-white/10 p-[1px]'>
      <div className='rounded-xl bg-white/[0.03] p-4 backdrop-blur-xl'>
        <div className='flex items-start justify-between gap-3 mb-3'>
          <div className='flex items-center gap-3'>
            <div className='h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white grid place-items-center text-sm font-semibold'>
              {(post.authorName || post.author?.name || "A").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 className='font-semibold leading-tight' dangerouslySetInnerHTML={{ __html: post.highlight?.title || post.title }} />
              <div className='text-xs text-gray-500'>{new Date(post.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
        <p
          className='text-sm text-gray-200 whitespace-pre-wrap'
          dangerouslySetInnerHTML={{ __html: post.highlight?.content || post.content }}
        />
        {post.tags?.length ? (
          <div className='mt-3 flex flex-wrap gap-2'>
            {(post.highlight?.tags?.length ? post.highlight.tags : post.tags).map((t, i) => (
              <span
                key={`${t}-${i}`}
                className='text-[10px] uppercase tracking-wide border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded-full'
                dangerouslySetInnerHTML={{ __html: t }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  const prev = () => onPageChange(Math.max(1, (page || 1) - 1));
  const next = () => onPageChange(Math.min(totalPages || 1, (page || 1) + 1));
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className='mt-6 flex items-center justify-center gap-2'>
      <button
        onClick={prev}
        disabled={(page || 1) <= 1}
        className='px-3 py-1.5 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50'
      >
        Previous
      </button>
      <span className='text-xs text-gray-400'>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={next}
        disabled={(page || 1) >= (totalPages || 1)}
        className='px-3 py-1.5 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50'
      >
        Next
      </button>
    </div>
  );
}

function CommentSection({ post, onAddComment, onAddReply }) {
  const [commentText, setCommentText] = useState("");
  const [commentName, setCommentName] = useState("");
  const [replyTextByComment, setReplyTextByComment] = useState({});
  const [replyNameByComment, setReplyNameByComment] = useState({});

  return (
    <div className='space-y-3'>
      <div className='flex flex-col sm:flex-row gap-2'>
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder='Add a comment'
          className='flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
        />
        <input
          value={commentName}
          onChange={(e) => setCommentName(e.target.value)}
          placeholder='Name'
          className='sm:w-40 rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
        />
        <button
          onClick={() => {
            onAddComment(post._id, commentText, commentName);
            setCommentText("");
            setCommentName("");
          }}
          className='rounded-lg bg-indigo-600/90 hover:bg-indigo-500 transition text-white px-3 py-2.5 text-sm font-medium'
        >
          Comment
        </button>
      </div>

      <ul className='space-y-3'>
        {post.comments?.map((c) => (
          <li key={c._id} className='rounded-lg border border-white/10 bg-black/20 p-3'>
            <div className='flex items-start gap-3'>
              <div className='h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white grid place-items-center text-xs font-semibold'>
                {(c.authorName || c.author?.name || "A").slice(0, 1).toUpperCase()}
              </div>
              <div className='flex-1'>
                <div className='text-sm'>
                  <span className='font-medium'>{c.authorName || c.author?.name || "Anonymous"}</span>
                  <span className='text-xs text-gray-500 ml-2'>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div className='text-sm text-gray-200 whitespace-pre-wrap mt-1'>{c.content}</div>

                <div className='mt-2 ml-2 border-l border-white/10 pl-3'>
                  <div className='flex flex-col sm:flex-row gap-2 mb-2'>
                    <input
                      value={replyTextByComment[c._id] || ""}
                      onChange={(e) => setReplyTextByComment((s) => ({ ...s, [c._id]: e.target.value }))}
                      placeholder='Reply'
                      className='flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                    />
                    <input
                      value={replyNameByComment[c._id] || ""}
                      onChange={(e) => setReplyNameByComment((s) => ({ ...s, [c._id]: e.target.value }))}
                      placeholder='Name'
                      className='sm:w-40 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                    />
                    <button
                      onClick={() => {
                        onAddReply(post._id, c._id, replyTextByComment[c._id], replyNameByComment[c._id]);
                        setReplyTextByComment((s) => ({ ...s, [c._id]: "" }));
                        setReplyNameByComment((s) => ({ ...s, [c._id]: "" }));
                      }}
                      className='rounded-lg bg-slate-600/90 hover:bg-slate-500 transition text-white px-3 py-2 text-sm font-medium'
                    >
                      Reply
                    </button>
                  </div>
                  {c.replies?.length ? (
                    <ul className='space-y-2'>
                      {c.replies.map((r) => (
                        <li key={r._id} className='text-sm text-gray-300'>
                          <span className='font-medium'>{r.authorName || r.author?.name || "Anonymous"}:</span> {r.content}
                          <span className='text-xs text-gray-500 ml-2'>{new Date(r.createdAt).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

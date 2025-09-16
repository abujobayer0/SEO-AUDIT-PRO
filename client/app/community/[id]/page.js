"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import ShinyText from "@/components/ShinyText";
import GradientBlinds from "@/components/GradientBlinds";
import { communityApi } from "@/lib/api";

export default function CommunityPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [commentName, setCommentName] = useState("");
  const [replyTextByComment, setReplyTextByComment] = useState({});
  const [replyNameByComment, setReplyNameByComment] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { post } = await communityApi.getPost(id);
      setPost(post);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const addComment = async () => {
    if (!commentText) return;
    try {
      setSubmitting(true);
      await communityApi.addComment(id, { content: commentText, authorName: commentName });
      setCommentText("");
      setCommentName("");
      await load();
    } catch (e) {
      setError(e.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const addReply = async (commentId) => {
    const content = replyTextByComment[commentId];
    const authorName = replyNameByComment[commentId];
    if (!content) return;
    try {
      setSubmitting(true);
      await communityApi.addReply(id, commentId, { content, authorName });
      setReplyTextByComment((s) => ({ ...s, [commentId]: "" }));
      setReplyNameByComment((s) => ({ ...s, [commentId]: "" }));
      await load();
    } catch (e) {
      setError(e.message || "Failed to add reply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='max-w-5xl mx-auto px-4 py-10'>
      <header className='bg-black/30 backdrop-blur-md w-full rounded-full shadow-xl border border-white/10 mb-6'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-3'>
            <Link href={"/"}>
              <div className='flex items-center'>
                <BarChart3 className='h-6 w-6 text-white' />
                <span className='ml-2 text-sm font-bold text-white'>Seo Inspect Pro</span>
              </div>
            </Link>
            <button
              onClick={() => router.push("/community")}
              className='px-3 py-1.5 rounded-full text-white border border-white/20 hover:border-white/50 transition-all text-sm'
            >
              Back to Community
            </button>
          </div>
        </div>
      </header>

      <div className='relative overflow-hidden rounded-2xl border border-white/10 p-[1px] mb-8'>
        <div className='relative rounded-2xl bg-black/40 '>
          {loading ? (
            <div className='text-sm text-gray-400'>Loading post…</div>
          ) : error ? (
            <div className='text-sm text-red-400'>{error}</div>
          ) : !post ? (
            <div className='text-sm text-gray-400'>Post not found.</div>
          ) : (
            <>
              {/* Post header with gradient background only here */}
              <div className='relative overflow-hidden p-5 mb-6 bg-white/[0.03]'>
                <div className='absolute inset-0 pointer-events-none'>
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
                <div className='px-6 py-8 md:px-10 md:py-12'>
                  <h1 className='relative  text-2xl md:text-3xl font-bold text-white mb-2'>
                    <ShinyText text={post.title} speed={10} color={"#fff"} className='font-bold' />
                  </h1>
                  <div className='relative text-xs text-gray-400'>
                    by <span className='text-gray-200'>{post.authorName || post.author?.name || "Anonymous"}</span> ·{" "}
                    {new Date(post.createdAt).toLocaleString()}
                  </div>
                  {post.tags?.length ? (
                    <div className='relative mt-3 flex flex-wrap gap-2'>
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
                </div>
              </div>

              {/* Post body content (plain) */}
              <article className='prose px-6 py-8 md:px-10 md:py-12 prose-invert max-w-none text-gray-100'>
                <p className='whitespace-pre-wrap text-sm leading-7'>{post.content}</p>
              </article>
            </>
          )}
        </div>
      </div>

      {post && (
        <section className='rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl'>
          <h2 className='text-lg font-semibold mb-4'>Comments ({post.comments?.length || 0})</h2>

          <div className='flex flex-col sm:flex-row gap-2 mb-4'>
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
              onClick={addComment}
              disabled={submitting}
              className='rounded-lg bg-indigo-600/90 hover:bg-indigo-500 transition text-white px-3 py-2.5 text-sm font-medium disabled:opacity-60'
            >
              {submitting ? "Posting…" : "Comment"}
            </button>
          </div>

          <ul className='space-y-4'>
            {post.comments?.map((c) => (
              <li key={c._id} className='rounded-lg border border-white/10 bg-black/20 p-4'>
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

                    <div className='mt-3 ml-2 border-l border-white/10 pl-3'>
                      {c.replies?.length ? (
                        <ul className='space-y-2 mb-3'>
                          {c.replies.map((r) => (
                            <li key={r._id} className='text-sm text-gray-300'>
                              <span className='font-medium'>{r.authorName || r.author?.name || "Anonymous"}:</span> {r.content}
                              <span className='text-xs text-gray-500 ml-2'>{new Date(r.createdAt).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <div className='flex flex-col sm:flex-row gap-2'>
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
                          onClick={() => addReply(c._id)}
                          disabled={submitting}
                          className='rounded-lg bg-slate-600/90 hover:bg-slate-500 transition text-white px-3 py-2 text-sm font-medium disabled:opacity-60'
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

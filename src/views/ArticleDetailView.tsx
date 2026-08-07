import React, { useState, useEffect } from 'react';
import { PostItem } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

interface ArticleDetailViewProps {
  post: PostItem;
  onBack: () => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  post,
  onBack,
  onToggleLike,
  onToggleSave,
}) => {
  const { showToast, addComment } = useApp();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; text: string; author_name: string }>>([]);

  useEffect(() => {
    api.getComments(post.id).then(setComments).catch(() => {});
  }, [post.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const result = await api.addComment(post.id, commentText.trim());
      setComments(prev => [{ id: result.id, text: result.text, author_name: result.authorName }, ...prev]);
      setCommentText('');
      showToast('Comment added!', 'success');
    } catch {
      showToast('Failed to add comment', 'error');
    }
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-3xl mx-auto">
      {/* Floating Back Button */}
      <button
        onClick={onBack}
        className="fixed top-20 left-4 md:left-10 z-40 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg border border-white/50 text-[#0058be] dark:text-[#adc6ff] hover:scale-105 active:scale-95 transition-all"
        title="Back"
      >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      </button>

      {/* Article Header & Image */}
      <div className="relative w-full h-[320px] md:h-[420px] rounded-3xl overflow-hidden shadow-lg mb-8">
        <img
          src={
            post.imageUrl ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDBN1k5xBvWZV7BDNgQ8dLu9v6FoU1C9TQ2bZYMJT-F93-aWNboYPx2eDoPszx3kFPrByyO4YeVXb3jXYJHzen0QvPvJhKvYjfPeEQEbY4cEc5-GWuLxgWEwWCCR0VQHP21yOJKkRqvfPd6bEURUKzTbMglYYq4fpWmSc34-8xu06WnTKGFcSZGM_QhWkRL_jjxTTrCNe01vbxHTiw2S9aDXS5QVdH9Qn5jy1T6WPUGJcNx90cn8ovyWA'
          }
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/90 via-[#0b1c30]/30 to-transparent flex flex-col justify-end p-6 md:p-10">
          <span className="px-3.5 py-1 bg-[#2170e4] text-white rounded-full text-xs font-semibold w-fit mb-3">
            {post.category || 'Article'}
          </span>
          <h1 className="font-headline text-2xl md:text-4xl font-bold text-white leading-tight">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Author & Meta Row */}
      <div className="glass-panel rounded-2xl p-4 md:p-6 mb-8 border border-white/60 dark:border-white/10 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800"
          />
          <div>
            <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white leading-tight">
              {post.author.name}
            </h3>
            <p className="text-xs text-[#424754] dark:text-gray-300">
              {post.reads || '5 min read'} • {post.date || 'Oct 12'}
            </p>
          </div>
        </div>

        <button className="px-5 py-2 rounded-full bg-[#0058be] text-white text-xs font-bold shadow-md hover:bg-[#2170e4] active:scale-95 transition-all">
          Follow
        </button>
      </div>

      {/* Article Content */}
      <article className="glass-card rounded-3xl p-6 md:p-10 border border-white/60 dark:border-white/10 shadow-sm space-y-6 text-[#0b1c30] dark:text-gray-100 leading-relaxed text-sm md:text-base">
        <p>
          {post.content ||
            `In an era defined by constant connectivity and visual noise, the concept of a truly quiet space has shifted from a luxury to a necessity. We find ourselves constantly bombarded by notifications, vibrant colors demanding attention, and the relentless hum of modern existence. The architecture of silence isn't merely about acoustic dampening; it is an overarching philosophy of spatial design that seeks to minimize cognitive load.`}
        </p>

        {/* Highlight Quote Block */}
        <div className="my-8 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700/80 border-l-4 border-[#2170e4] shadow-xs">
          <span className="material-symbols-outlined text-[#2170e4] text-[36px] mb-2">
            format_quote
          </span>
          <p className="font-headline text-lg md:text-xl font-bold italic text-[#0b1c30] dark:text-white leading-snug">
            "Silence is not the absence of sound, but the presence of space for mind and light to interact harmoniously."
          </p>
        </div>

        <p>
          By employing monochrome palettes, indirect lighting, and unadorned natural textures like linen, limestone, and washed concrete, spaces are transformed into peaceful sanctuaries.
        </p>

        {/* Horizontal Gallery */}
        {post.galleryImages && post.galleryImages.length > 0 && (
          <div className="pt-4">
            <h4 className="font-headline font-bold text-sm text-[#424754] dark:text-gray-300 mb-3">
              Spatial Gallery
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {post.galleryImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="w-64 h-44 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={imgUrl}
                    alt={`Gallery ${idx}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Interactive Engagement Bar */}
      <div className="mt-8 glass-panel rounded-2xl p-4 flex items-center justify-between border border-white/60 dark:border-white/10 shadow-md">
        <div className="flex items-center gap-6">
          <button
            onClick={() => onToggleLike(post.id)}
            className="flex items-center gap-2 text-xs font-semibold text-[#424754] dark:text-gray-300 hover:text-[#a43073] active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined text-[22px] text-[#a43073]"
              style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            <span>{post.likes} Likes</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#424754] dark:text-gray-300">
            <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
            <span>{comments.length} Comments</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(post.id)}
            className="p-2 rounded-full text-[#0058be] dark:text-[#adc6ff] hover:bg-white/50 active:scale-95 transition-all"
            title="Save"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: post.isSaved ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
          </button>

          <button
            onClick={async () => {
              try {
                if (navigator.share) {
                  await navigator.share({ title: post.title, url: window.location.href });
                } else if (navigator.clipboard) {
                  await navigator.clipboard.writeText(window.location.href);
                  showToast('Article link copied!', 'success');
                }
              } catch {
                // user cancelled share
              }
            }}
            className="p-2 rounded-full text-[#0058be] dark:text-[#adc6ff] hover:bg-white/50 active:scale-95 transition-all"
            title="Share"
          >
            <span className="material-symbols-outlined text-[22px]">share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8 glass-panel rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-sm">
        <h3 className="font-headline font-bold text-lg text-[#0b1c30] dark:text-white mb-4">
          Community Reactions ({comments.length})
        </h3>

        <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            className="flex-1 bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-[#0058be] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            Comment
          </button>
        </form>

        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs text-[#0b1c30] dark:text-gray-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[#0058be] dark:text-[#adc6ff]">
                  {c.author_name || 'Community Member'}
                </span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

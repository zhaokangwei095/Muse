import React, { useState } from 'react';
import { PostItem, User } from '../types';
import { POST_CATEGORIES } from '../constants';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

interface CreatePostViewProps {
  currentUser: User;
  onPublishPost: (data: { title: string; content?: string; imageUrl?: string; category: string; tags: string[] }) => Promise<void>;
  onCancel: () => void;
}



export const CreatePostView: React.FC<CreatePostViewProps> = ({
  currentUser,
  onPublishPost,
  onCancel,
}) => {
  const { showToast } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('生活');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDu-_ixsUK5Ahw6UE7emvYp_yEb-oNq04fL1uDkvCtUPHKk0WQf8zV0j38zqfkV254R2U4OJKPVx-OgRiycPsYXmAzV4KJSTHu93rRMbCnXOQuL0WjB_gdFVFzZ2Dtwl-aYGCB2ZPAxIHiwzhywtLJnb5iSqPfw48sl2v9GjeKc-_lg--MHwR2LV80pRn4sxU3w_toFbVJSuoxQgFNtbokAo0XcQT1T8JJFnV0MP9AXUWZyLNf16xBYjw'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  const handleGenerateInspiration = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt || title || 'A aesthetic post about architecture, studio art, or calm lifestyle.' }),
      });
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.text) setContent(data.text);
      if (data.tags && Array.isArray(data.tags)) setTagsInput(data.tags.join(' '));
      if (data.suggestedCategory && POST_CATEGORIES.includes(data.suggestedCategory as any)) {
        setCategory(data.suggestedCategory);
      }
      setShowAiModal(false);
    } catch (err) {
      console.error(err);
      showToast('AI generation failed. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(' ')
      .filter((t) => t.trim().length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    try {
      await onPublishPost({
        title,
        content,
        imageUrl: imageUrl.trim() ? imageUrl : undefined,
        category,
        tags: parsedTags.length > 0 ? parsedTags : ['#Inspiration', '#Muse'],
      } as any);
    } catch (err) {
      // error already handled by context
    }
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#0b1c30] dark:text-white">
            Capture Inspiration
          </h2>
          <p className="text-xs text-[#424754] dark:text-gray-300">
            Share your story, art, or aesthetic moment
          </p>
        </div>

        <button
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-[#2170e4] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          <span>AI Muse</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 glass-panel rounded-3xl p-6 md:p-8 border border-white/60 dark:border-white/10 shadow-sm">
        {/* Cover Image URL / Preview */}
        <div>
          <label className="block text-xs font-semibold text-[#424754] dark:text-gray-300 mb-2">
            Image Cover URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
              placeholder="https://..."
            />
          </div>
          {imageUrl && (
            <div className="mt-3 relative h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#424754] dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-base font-bold text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
            placeholder="Give your story a title..."
            required
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#424754] dark:text-gray-300 mb-2">
            Category
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {POST_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-[#0058be] text-white shadow-sm'
                    : 'bg-white/60 dark:bg-slate-800 text-[#424754] dark:text-gray-300 hover:bg-white/90'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-[#424754] dark:text-gray-300 mb-2">
            Story / Thoughts
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be] resize-none"
            placeholder="Write your story..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-[#424754] dark:text-gray-300 mb-2">
            Hashtags (Space separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
            placeholder="#Studio #Watercolor #Art"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-[#424754] dark:text-gray-300 hover:bg-white/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white shadow-md hover:shadow-lg active:scale-95 transition-all"
          >
            Publish Post
          </button>
        </div>
      </form>

      {/* AI Inspiration Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-white/60 dark:border-white/20">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 text-[#424754] dark:text-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-4 text-[#0058be]">
              <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
              <h3 className="font-headline text-xl font-bold text-[#0b1c30] dark:text-white">
                AI Muse Inspiration Generator
              </h3>
            </div>

            <p className="text-xs text-[#424754] dark:text-gray-300 mb-4">
              Enter a theme or idea, and Muse AI will draft a compelling title, text, and hashtags for your post.
            </p>

            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Morning coffee in Kyoto, Scandinavian interior design..."
              className="w-full bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be] mb-6"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-5 py-2 rounded-full text-xs font-semibold text-[#424754]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateInspiration}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-[#2170e4] text-white shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      sync
                    </span>
                    <span>Inspiring...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">sparkles</span>
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

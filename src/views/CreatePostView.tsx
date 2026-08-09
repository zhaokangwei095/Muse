import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PostItem, User } from '../types';
import { POST_CATEGORIES } from '../constants';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

interface CreatePostViewProps {
  currentUser: User;
  onPublishPost: (data: { title: string; content?: string; imageUrl?: string; category: string; tags: string[] }) => Promise<void>;
  onCancel: () => void;
}

// Local gacha fallback when AI is not configured (keeps the draw always working)
const FALLBACK_TITLES = [
  '在光影之间，寻找安静的秩序',
  '一杯咖啡的时间，收藏清晨的质感',
  '极简，是对生活最温柔的克制',
  '城市角落里被忽略的美学瞬间',
  '把日子过成一首安静的诗',
  '慢下来的艺术：质感生活手记',
];
const FALLBACK_TEXTS = [
  '真正的美往往藏在日常的缝隙里。当我们放慢脚步，光线、材质与色彩的微妙关系便会自然浮现。愿这份微小的灵感，也能点亮你平凡的一天。',
  '生活的质感不来自昂贵的堆砌，而来自用心的选择。每一个被认真对待的瞬间，都会在某一天回馈我们以温柔。',
  '克制不是贫乏，而是把空间留给真正重要的事物。当我们学会删繁就简，美便以最纯粹的样子自然呈现。',
];
const FALLBACK_TAGS = ['#Inspiration', '#Aesthetic', '#Lifestyle', '#Minimalism', '#Muse', '#DailyMuse'];

function localInspiration(prompt: string) {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  let category = '生活';
  if (/建筑|设计|空间|极简/.test(prompt)) category = '艺术设计';
  else if (/AI|科技|智能|未来/.test(prompt)) category = 'AI科技';
  else if (/旅行|城市|京都|海边|山/.test(prompt)) category = '旅行';
  else if (/摄影|镜头|光影|胶片/.test(prompt)) category = '摄影';
  const tags = [pick(FALLBACK_TAGS), pick(FALLBACK_TAGS), prompt.trim() ? `#${prompt.trim().slice(0, 8)}` : '#Muse'];
  return {
    title: pick(FALLBACK_TITLES),
    text: pick(FALLBACK_TEXTS),
    tags: Array.from(new Set(tags)).slice(0, 3),
    suggestedCategory: category,
  };
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
  // Gacha modal opens automatically when entering the create page
  const [showAiModal, setShowAiModal] = useState(true);
  const [gachaPhase, setGachaPhase] = useState<'input' | 'drawing' | 'result'>('input');
  const [drawnCard, setDrawnCard] = useState<{ title: string; text: string; tags: string[]; suggestedCategory: string } | null>(null);

  const handleGenerateInspiration = async () => {
    setIsGenerating(true);
    setGachaPhase('drawing');
    const minDelay = new Promise((r) => setTimeout(r, 1500));
    try {
      let data: { title: string; text: string; tags: string[]; suggestedCategory: string };
      try {
        data = await api.generateInspiration(aiPrompt || title || 'A aesthetic post about architecture, studio art, or calm lifestyle.');
        if (!data.title) throw new Error('empty');
      } catch {
        // AI unavailable: local gacha fallback keeps the experience intact
        await new Promise((r) => setTimeout(r, 300));
        data = localInspiration(aiPrompt || title);
      }
      await minDelay;
      setDrawnCard(data);
      setGachaPhase('result');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyDrawnCard = () => {
    if (!drawnCard) return;
    setTitle(drawnCard.title);
    setContent(drawnCard.text);
    setTagsInput(drawnCard.tags.join(' '));
    if (POST_CATEGORIES.includes(drawnCard.suggestedCategory as any)) {
      setCategory(drawnCard.suggestedCategory);
    }
    setShowAiModal(false);
    setGachaPhase('input');
    showToast('灵感卡已填入，继续完善你的帖子吧', 'success');
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
          onClick={() => { setShowAiModal(true); setGachaPhase('input'); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-[#2170e4] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">casino</span>
          <span>灵感抽卡</span>
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

      {/* Gacha Inspiration Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-white/60 dark:border-white/20"
            >
              <button
                onClick={() => { setShowAiModal(false); setGachaPhase('input'); }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 text-[#424754] dark:text-gray-200 transition-colors z-10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              {/* Phase: input */}
              {gachaPhase === 'input' && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-[#0058be]">
                    <span className="material-symbols-outlined text-[28px]">casino</span>
                    <h3 className="font-headline text-xl font-bold text-[#0b1c30] dark:text-white">
                      灵感抽卡
                    </h3>
                  </div>
                  <p className="text-xs text-[#424754] dark:text-gray-300 mb-4">
                    写下一句话主题，抽一张灵感卡 —— AI 会为你完善标题、正文与标签
                  </p>

                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="例如：京都的清晨咖啡、极简书房、海边的日落..."
                    className="w-full bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be] mb-6"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateInspiration(); }}
                  />

                  <button
                    type="button"
                    onClick={handleGenerateInspiration}
                    className="w-full py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 to-[#2170e4] text-white shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">stylus_note</span>
                    <span>开始抽卡</span>
                  </button>
                </div>
              )}

              {/* Phase: drawing animation */}
              {gachaPhase === 'drawing' && (
                <div className="py-10 flex flex-col items-center">
                  <motion.div
                    animate={{ rotateY: [0, 180, 360], scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-28 h-40 rounded-2xl bg-gradient-to-tr from-purple-600 via-[#2170e4] to-[#0058be] shadow-2xl flex items-center justify-center mb-6"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <span className="material-symbols-outlined text-[44px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                  </motion.div>
                  <p className="font-headline font-bold text-base text-[#0b1c30] dark:text-white animate-pulse">
                    灵感正在凝聚...
                  </p>
                  <p className="text-xs text-[#424754] dark:text-gray-300 mt-1">AI 为你完善文案中</p>
                </div>
              )}

              {/* Phase: result card reveal */}
              {gachaPhase === 'result' && drawnCard && (
                <motion.div
                  initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
                  animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700/70 border-2 border-[#2170e4]/40 p-5 mb-5 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-[#2170e4] text-white text-[10px] font-bold">
                        ✦ 灵感卡 SSR
                      </span>
                      <span className="text-[10px] text-[#0058be] dark:text-[#adc6ff] font-semibold">{drawnCard.suggestedCategory}</span>
                    </div>
                    <h4 className="font-headline text-lg font-bold text-[#0b1c30] dark:text-white leading-snug mb-2">
                      {drawnCard.title}
                    </h4>
                    <p className="text-xs text-[#424754] dark:text-gray-300 leading-relaxed line-clamp-4 mb-3">
                      {drawnCard.text}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {drawnCard.tags.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-[#eff4ff] dark:bg-slate-700 text-[#0058be] dark:text-[#adc6ff] text-[10px] font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setGachaPhase('input'); setDrawnCard(null); }}
                      className="flex-1 py-2.5 rounded-full text-xs font-bold text-[#424754] dark:text-gray-300 bg-white/60 dark:bg-slate-800 hover:bg-white transition-colors"
                    >
                      再抽一张
                    </button>
                    <button
                      type="button"
                      onClick={applyDrawnCard}
                      className="flex-1 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white shadow-md active:scale-95 transition-all"
                    >
                      使用这张卡
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

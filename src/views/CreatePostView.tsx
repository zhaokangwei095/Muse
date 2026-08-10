import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PostItem, User } from '../types';
import { POST_CATEGORIES } from '../constants';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  COLOR_PROFILES,
  COLOR_RING_LAYOUT,
  ColorProfile,
  computeEmotions,
  buildPersonalNote,
  UserStats,
} from '../data/colorPsychology';
import { saveToAlbum } from '../components/CardAlbumModal';

interface CreatePostViewProps {
  currentUser: User;
  onPublishPost: (data: { title: string; content?: string; imageUrl?: string; category: string; tags: string[] }) => Promise<void>;
  onCancel: () => void;
}

type RitualPhase = 'breath' | 'color' | 'insight' | 'drawing' | 'result';

const BREATH_TEXTS = ['缓缓吸气…', '轻轻停顿…', '慢慢呼出…', '再感受一次此刻…'];

// Map each color to a post category for the generated card
const COLOR_CATEGORY: Record<string, string> = {
  blue: '艺术设计',
  purple: '观点',
  green: '生活',
  red: '旅行',
  yellow: '生活',
  orange: '生活',
  pink: '摄影',
  white: '观点',
};

const EMOTION_BARS: Array<{ key: keyof ReturnType<typeof computeEmotions>; label: string; color: string }> = [
  { key: 'curiosity', label: '探索欲', color: 'linear-gradient(90deg,#2170e4,#7cc0ff)' },
  { key: 'creativity', label: '创造欲', color: 'linear-gradient(90deg,#7c3aed,#c084fc)' },
  { key: 'energy', label: '能量感', color: 'linear-gradient(90deg,#f59e0b,#fde047)' },
  { key: 'calm', label: '平静感', color: 'linear-gradient(90deg,#10b981,#6ee7b7)' },
  { key: 'fatigue', label: '疲惫', color: 'linear-gradient(90deg,#64748b,#94a3b8)' },
  { key: 'loneliness', label: '孤独', color: 'linear-gradient(90deg,#475569,#64748b)' },
];

export const CreatePostView: React.FC<CreatePostViewProps> = ({
  currentUser,
  onPublishPost,
  onCancel,
}) => {
  const { showToast, posts, bookmarks } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('生活');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDu-_ixsUK5Ahw6UE7emvYp_yEb-oNq04fL1uDkvCtUPHKk0WQf8zV0j38zqfkV254R2U4OJKPVx-OgRiycPsYXmAzV4KJSTHu93rRMbCnXOQuL0WjB_gdFVFzZ2Dtwl-aYGCB2ZPAxIHiwzhywtLJnb5iSqPfw48sl2v9GjeKc-_lg--MHwR2LV80pRn4sxU3w_toFbVJSuoxQgFNtbokAo0XcQT1T8JJFnV0MP9AXUWZyLNf16xBYjw'
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // ---- Ritual state ----
  // The ritual opens automatically when entering the create page
  const [showRitual, setShowRitual] = useState(true);
  const [phase, setPhase] = useState<RitualPhase>('breath');
  const [breathText, setBreathText] = useState(BREATH_TEXTS[0]);
  const [selectedColor, setSelectedColor] = useState<ColorProfile | null>(null);
  const [moodWord, setMoodWord] = useState('');
  const [drawnCard, setDrawnCard] = useState<{ title: string; text: string; tags: string[]; suggestedCategory: string } | null>(null);

  // Personalized stats from the user's real activity
  const userStats: UserStats = useMemo(() => {
    const ownPosts = posts.filter((p) => p.author.name === currentUser.name);
    const catCount = new Map<string, number>();
    ownPosts.forEach((p) => catCount.set(p.category, (catCount.get(p.category) || 0) + 1));
    let topCategory: string | undefined;
    let max = 0;
    catCount.forEach((n, c) => { if (n > max) { max = n; topCategory = c; } });
    return {
      postsCount: currentUser.postsCount,
      bookmarksCount: bookmarks.length,
      likedCount: posts.filter((p) => p.isLiked).length,
      topCategory,
    };
  }, [posts, bookmarks, currentUser]);

  const emotions = useMemo(
    () => (selectedColor ? computeEmotions(selectedColor, userStats) : null),
    [selectedColor, userStats]
  );

  // Breathing guidance text cycle
  useEffect(() => {
    if (phase !== 'breath') return;
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % BREATH_TEXTS.length;
      setBreathText(BREATH_TEXTS[i]);
    }, 2400);
    return () => clearInterval(timer);
  }, [phase]);

  const resetRitual = () => {
    setPhase('breath');
    setSelectedColor(null);
    setMoodWord('');
    setDrawnCard(null);
  };

  const pickColor = (c: ColorProfile) => {
    if (selectedColor) return;
    setSelectedColor(c);
    setTimeout(() => setPhase('insight'), 700);
  };

  // Local fallback card generator, flavored by the chosen color
  const localInspiration = (profile: ColorProfile) => {
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const theme = pick(profile.themes);
    return {
      title: pick(profile.fallbackTitles),
      text: pick(profile.fallbackTexts),
      tags: [`#${profile.name}色心境`, `#${theme.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')}`, '#Muse'],
      suggestedCategory: COLOR_CATEGORY[profile.id] || '生活',
    };
  };

  const handleDrawCard = async () => {
    if (!selectedColor) return;
    setIsGenerating(true);
    setPhase('drawing');
    const minDelay = new Promise((r) => setTimeout(r, 1600));
    try {
      let data: { title: string; text: string; tags: string[]; suggestedCategory: string };
      const prompt = `${selectedColor.themes.join('、')}，一种${selectedColor.name}色的心境${moodWord.trim() ? `，关于「${moodWord.trim()}」` : ''}`;
      try {
        data = await api.generateInspiration(prompt);
        if (!data.title) throw new Error('empty');
      } catch {
        // AI unavailable: color-flavored local card keeps the ritual alive
        await new Promise((r) => setTimeout(r, 300));
        data = localInspiration(selectedColor);
      }
      await minDelay;
      setDrawnCard(data);
      setPhase('result');
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
    setShowRitual(false);
    resetRitual();
    showToast('灵感卡已填入，继续完善你的帖子吧', 'success');
  };

  const handleSaveToAlbum = () => {
    if (!drawnCard || !selectedColor) return;
    saveToAlbum({
      id: `album_${Date.now()}`,
      colorId: selectedColor.id,
      colorName: selectedColor.name,
      gradient: selectedColor.gradient,
      title: drawnCard.title,
      text: drawnCard.text,
      tags: drawnCard.tags,
      category: drawnCard.suggestedCategory,
      savedAt: new Date().toISOString(),
    });
    showToast('已存入灵感卡册 ✨', 'success');
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
          onClick={() => { setShowRitual(true); resetRitual(); }}
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

      {/* ==================== Color Ritual Modal ==================== */}
      <AnimatePresence>
        {showRitual && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-white/60 dark:border-white/20 max-h-[88vh] overflow-y-auto no-scrollbar"
            >
              <button
                onClick={() => { setShowRitual(false); resetRitual(); }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 text-[#424754] dark:text-gray-200 transition-colors z-10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              {/* Phase 1: Breathing Guidance */}
              {phase === 'breath' && (
                <div className="py-8 flex flex-col items-center text-center">
                  <p className="text-[11px] tracking-[0.3em] text-[#424754] dark:text-gray-400 mb-8">灵感抽卡 · 心境仪式</p>
                  <div className="relative w-44 h-44 flex items-center justify-center mb-8">
                    <motion.div
                      animate={{ scale: [1, 1.42, 1.42, 1], opacity: [0.35, 0.6, 0.6, 0.35] }}
                      transition={{ duration: 9.6, times: [0, 0.4, 0.6, 1], repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/40 via-[#2170e4]/40 to-[#fc79bd]/40 blur-xl"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.35, 1.35, 1] }}
                      transition={{ duration: 9.6, times: [0, 0.4, 0.6, 1], repeat: Infinity, ease: 'easeInOut' }}
                      className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-500 via-[#2170e4] to-[#0058be] shadow-2xl flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[36px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                        spa
                      </span>
                    </motion.div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={breathText}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.5 }}
                      className="font-headline text-lg font-bold text-[#0b1c30] dark:text-white mb-2"
                    >
                      {breathText}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-xs text-[#424754] dark:text-gray-300 mb-8 leading-relaxed">
                    回忆最近让你心头一动的瞬间<br />让呼吸慢下来，跟随直觉就好
                  </p>
                  <button
                    onClick={() => setPhase('color')}
                    className="px-8 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-[#2170e4] text-white shadow-lg hover:opacity-90 active:scale-95 transition-all"
                  >
                    我准备好了
                  </button>
                </div>
              )}

              {/* Phase 2: Color Ring Selection */}
              {phase === 'color' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4">
                  <h3 className="font-headline text-lg font-bold text-center text-[#0b1c30] dark:text-white mb-1">
                    不用思考
                  </h3>
                  <p className="text-sm text-center text-[#424754] dark:text-gray-300 mb-4">
                    你现在最想靠近哪一种颜色？
                  </p>

                  <div className="relative w-[290px] h-[290px] mx-auto mb-4">
                    {COLOR_PROFILES.map((c) => {
                      const pos = COLOR_RING_LAYOUT[c.id];
                      const isPicked = selectedColor?.id === c.id;
                      const dimmed = selectedColor && !isPicked;
                      return (
                        <motion.button
                          key={c.id}
                          type="button"
                          onClick={() => pickColor(c)}
                          animate={{
                            scale: isPicked ? 1.35 : 1,
                            opacity: dimmed ? 0.25 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          whileHover={selectedColor ? undefined : { scale: 1.18 }}
                          className="absolute w-[52px] h-[52px] rounded-full cursor-pointer border-2 border-white/70 dark:border-white/30"
                          style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            background: c.gradient,
                            boxShadow: isPicked ? `0 0 34px 6px ${c.glow}` : `0 4px 14px ${c.glow}`,
                          }}
                          aria-label={c.name}
                        />
                      );
                    })}
                    {/* Center hint */}
                    {!selectedColor && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-[#424754]/70 dark:text-gray-400/70 tracking-widest">凭直觉</span>
                      </div>
                    )}
                  </div>

                  {selectedColor && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm font-bold text-[#0b1c30] dark:text-white"
                    >
                      {selectedColor.name}色 · 正在读取你的心境…
                    </motion.p>
                  )}

                  {/* Optional mood word */}
                  {!selectedColor && (
                    <input
                      type="text"
                      value={moodWord}
                      onChange={(e) => setMoodWord(e.target.value)}
                      placeholder="选填：此刻想到的一个词…"
                      className="w-full bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
                    />
                  )}
                </motion.div>
              )}

              {/* Phase 3: Insight + Emotion Data */}
              {phase === 'insight' && selectedColor && emotions && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="w-10 h-10 rounded-full border-2 border-white/70 dark:border-white/30 shrink-0"
                      style={{ background: selectedColor.gradient, boxShadow: `0 0 22px ${selectedColor.glow}` }}
                    />
                    <div>
                      <p className="text-[10px] tracking-[0.25em] text-[#424754] dark:text-gray-400">你的{selectedColor.name}色心境</p>
                      <h3 className="font-headline text-base font-bold text-[#0b1c30] dark:text-white">心境解读</h3>
                    </div>
                  </div>

                  {/* Insight quote */}
                  <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700/70 border-l-4 p-4 mb-5"
                    style={{ borderLeftColor: selectedColor.glow.replace(/[\d.]+\)$/, '1)') }}>
                    <p className="font-headline text-base font-bold italic leading-relaxed text-[#0b1c30] dark:text-white">
                      「{selectedColor.insight}」
                    </p>
                  </div>

                  {/* Emotion bars */}
                  <div className="space-y-2.5 mb-5">
                    {EMOTION_BARS.map((bar, i) => {
                      const value = emotions[bar.key];
                      return (
                        <div key={bar.key} className="flex items-center gap-2.5">
                          <span className="w-12 text-[11px] text-[#424754] dark:text-gray-300 shrink-0">{bar.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-200/70 dark:bg-slate-700/50 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${value}%` }}
                              transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                              className="h-full rounded-full"
                              style={{ background: bar.color }}
                            />
                          </div>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.12 }}
                            className="w-9 text-right text-[11px] font-bold text-[#0b1c30] dark:text-white"
                          >
                            {value}%
                          </motion.span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Personal note based on user activity */}
                  <p className="text-[11px] text-[#424754] dark:text-gray-400 leading-relaxed mb-3">
                    {buildPersonalNote(userStats, selectedColor)}
                  </p>

                  {/* Positive affirmation */}
                  <div className="rounded-2xl bg-[#eff4ff] dark:bg-[#2170e4]/15 p-3.5 mb-5 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0058be] dark:text-[#adc6ff] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <p className="text-xs leading-relaxed text-[#0058be] dark:text-[#adc6ff] font-medium">
                      {selectedColor.affirmation}
                    </p>
                  </div>

                  <button
                    onClick={handleDrawCard}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 to-[#2170e4] text-white shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">stylus_note</span>
                    <span>为我抽取灵感卡</span>
                  </button>
                </motion.div>
              )}

              {/* Phase 4: Drawing animation */}
              {phase === 'drawing' && (
                <div className="py-10 flex flex-col items-center">
                  <motion.div
                    animate={{ rotateY: [0, 180, 360], scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-28 h-40 rounded-2xl shadow-2xl flex items-center justify-center mb-6"
                    style={{
                      transformStyle: 'preserve-3d',
                      background: selectedColor
                        ? selectedColor.gradient
                        : 'linear-gradient(135deg,#7c3aed,#2170e4)',
                    }}
                  >
                    <span className="material-symbols-outlined text-[44px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                  </motion.div>
                  <p className="font-headline font-bold text-base text-[#0b1c30] dark:text-white animate-pulse">
                    灵感正在凝聚…
                  </p>
                  <p className="text-xs text-[#424754] dark:text-gray-300 mt-1">
                    以{selectedColor?.name}色心境为引，为你完善文案
                  </p>
                </div>
              )}

              {/* Phase 5: Result card reveal */}
              {phase === 'result' && drawnCard && selectedColor && (
                <motion.div
                  initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
                  animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <div
                    className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700/70 border-2 p-5 mb-5 shadow-lg"
                    style={{ borderColor: selectedColor.glow }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ background: selectedColor.gradient }}>
                        ✦ {selectedColor.name}色灵感卡
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
                      onClick={() => { setPhase('insight'); setDrawnCard(null); }}
                      className="flex-1 py-2.5 rounded-full text-xs font-bold text-[#424754] dark:text-gray-300 bg-white/60 dark:bg-slate-800 hover:bg-white transition-colors"
                    >
                      再抽一张
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveToAlbum}
                      className="flex-1 py-2.5 rounded-full text-xs font-bold text-[#7c3aed] bg-purple-100/70 dark:bg-purple-900/30 hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">collections_bookmark</span>
                      存入卡册
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

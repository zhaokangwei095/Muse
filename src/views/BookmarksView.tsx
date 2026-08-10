import React, { useState, useEffect } from 'react';
import { BookmarkCollection, PostItem } from '../types';
import { BOOKMARK_CATEGORIES, FALLBACK_IMG } from '../constants';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

interface BookmarksViewProps {
  bookmarks: BookmarkCollection[];
  onSelectBookmark: (bm: BookmarkCollection) => void;
  onRemoveBookmark: (id: string) => void;
  onSelectPost?: (post: PostItem) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onSelectBookmark,
  onRemoveBookmark,
  onSelectPost,
}) => {
  const { favTags, toggleFavTag, followedIds, showToast } = useApp();
  const [tab, setTab] = useState<'saved' | 'following'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [followingPosts, setFollowingPosts] = useState<PostItem[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Load posts from followed authors when the Following tab is active
  useEffect(() => {
    if (tab !== 'following') return;
    setLoadingFollowing(true);
    api.getFollowingPosts()
      .then(setFollowingPosts)
      .catch(() => setFollowingPosts([]))
      .finally(() => setLoadingFollowing(false));
  }, [tab, followedIds.length]);

  const filteredBookmarks = bookmarks.filter((bm) => {
    const matchesCat = selectedCat === 'All' || bm.category === selectedCat;
    const matchesSearch =
      bm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bm.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-[1200px] mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#0b1c30] dark:text-white">
            关注
          </h2>
          <p className="text-xs text-[#424754] dark:text-gray-300">
            收藏的灵感与关注的创作者
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索收藏内容..."
            className="w-full bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 py-2 text-xs text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#424754] text-[18px]">
            search
          </span>
        </div>
      </div>

      {/* Tabs: Saved / Following */}
      <div className="flex gap-2 mb-5">
        {([['saved', '收藏'], ['following', '关注的创作者']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
              tab === key
                ? 'bg-[#2170e4] text-white shadow-sm'
                : 'glass-card text-[#424754] dark:text-gray-300'
            }`}
          >
            {label}
            {key === 'following' && followedIds.length > 0 && (
              <span className="ml-1 opacity-80">({followedIds.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Favorite tags (long-pressed in the feed, settled here) */}
      {favTags.length > 0 && (
        <div className="glass-card rounded-2xl p-3.5 mb-6 border border-white/60 dark:border-white/10">
          <p className="text-[11px] font-bold text-[#424754] dark:text-gray-300 mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            收藏的标签
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {favTags.map((key) => {
              const tag = key.split(':').slice(1).join(':');
              return (
                <button
                  key={key}
                  onClick={() => { toggleFavTag(key); showToast('已取消收藏标签', 'info'); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] dark:bg-slate-700/60 text-[#424754] dark:text-gray-300 text-[10px] font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="点击取消收藏"
                >
                  <span className="material-symbols-outlined text-[11px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'following' ? (
        /* ---------- Following feed ---------- */
        loadingFollowing ? (
          <div className="py-16 text-center text-[#424754] dark:text-gray-400">
            <span className="material-symbols-outlined text-[32px] animate-spin inline-block mb-2">progress_activity</span>
            <p className="text-xs">加载关注动态…</p>
          </div>
        ) : followingPosts.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-[#424754] dark:text-gray-300">
            <span className="material-symbols-outlined text-[48px] text-slate-400 mb-2 block">person_add</span>
            <p className="font-headline text-lg font-bold">还没有关注动态</p>
            <p className="text-xs mt-1">去探索页打开文章，点击 Follow 关注喜欢的创作者</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {followingPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost?.(post)}
                className="glass-card rounded-3xl overflow-hidden cursor-pointer group hover:-translate-y-1 transition-all shadow-sm border border-white/60 dark:border-white/10 flex gap-4 p-4"
              >
                {post.imageUrl && (
                  <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-1.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-[11px] font-semibold text-[#424754] dark:text-gray-300 truncate">{post.author.name}</span>
                    <span className="text-[10px] text-[#424754]/60 dark:text-gray-500 ml-auto shrink-0">{post.date || ''}</span>
                  </div>
                  <h3 className="font-headline text-sm font-bold text-[#0b1c30] dark:text-white leading-snug line-clamp-2 mb-1.5">
                    {post.title}
                  </h3>
                  <div className="mt-auto flex items-center gap-3 text-[11px] text-[#424754] dark:text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px] text-[#a43073]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      {post.likes}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] dark:bg-slate-700/60 text-[10px]">{post.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ---------- Saved bookmarks ---------- */
        <>
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
            {BOOKMARK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCat === cat
                    ? 'bg-[#2170e4] text-white shadow-sm'
                    : 'glass-card text-[#424754] dark:text-gray-300 hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bookmark Cards Grid */}
          {filteredBookmarks.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center text-[#424754] dark:text-gray-300">
              <span className="material-symbols-outlined text-[48px] text-slate-400 mb-2 block">
                bookmark_border
              </span>
              <p className="font-headline text-lg font-bold">暂无关注内容</p>
              <p className="text-xs">去探索页发现灵感并收藏到你的关注列表吧。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredBookmarks.map((bm) => (
                <div
                  key={bm.id}
                  onClick={() => onSelectBookmark(bm)}
                  className="glass-card rounded-3xl p-5 cursor-pointer group hover:-translate-y-1 transition-all shadow-sm border border-white/60 dark:border-white/10 flex flex-col md:flex-row gap-5"
                >
                  <div className="relative w-full md:w-44 h-40 rounded-2xl overflow-hidden shrink-0">
                    <img
                      src={bm.imageUrl}
                      alt={bm.title}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      {bm.category}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] text-[#0058be] dark:text-[#adc6ff] font-semibold">
                        {bm.source}
                      </span>
                      <h3 className="font-headline text-lg font-bold text-[#0b1c30] dark:text-white leading-tight mt-1 mb-2">
                        {bm.title}
                      </h3>
                      <p className="text-xs text-[#424754] dark:text-gray-300 line-clamp-2 leading-relaxed">
                        {bm.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {bm.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-[#eff4ff] dark:bg-slate-700 text-[#424754] dark:text-gray-300 text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBookmark(bm.id);
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Remove Bookmark"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

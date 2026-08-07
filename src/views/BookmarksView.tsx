import React, { useState } from 'react';
import { BookmarkCollection } from '../types';
import { BOOKMARK_CATEGORIES } from '../constants';

interface BookmarksViewProps {
  bookmarks: BookmarkCollection[];
  onSelectBookmark: (bm: BookmarkCollection) => void;
  onRemoveBookmark: (id: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onSelectBookmark,
  onRemoveBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');



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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#0b1c30] dark:text-white">
            关注
          </h2>
          <p className="text-xs text-[#424754] dark:text-gray-300">
            收藏的帖子与灵感清单
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
          <span className="material-symbols-outlined text-[48px] text-slate-400 mb-2">
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
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
    </div>
  );
};

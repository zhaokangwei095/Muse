import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PostItem } from '../types';
import { DiscoveryFeedView } from './DiscoveryFeedView';
import { ExploreSwipeView } from './ExploreSwipeView';

interface ExploreTabViewProps {
  posts: PostItem[];
  cards: PostItem[];
  mode: ExploreMode;
  onModeChange: (mode: ExploreMode) => void;
  onSelectPost: (post: PostItem) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onOpenMessagesWithAuthor?: (authorName: string) => void;
}

type ExploreMode = 'feed' | 'cards';

// Cross-fade + subtle slide when switching between feed and cards modes
const modeVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

export const ExploreTabView: React.FC<ExploreTabViewProps> = ({
  posts,
  cards,
  mode,
  onModeChange,
  onSelectPost,
  onToggleLike,
  onToggleSave,
  onOpenMessagesWithAuthor,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Global search across title / tags / author name
  const searchedPosts = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  return (
    <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-[1440px] mx-auto">
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索灵感 / 作者 / 标签…"
          className="w-full glass-card border border-white/60 dark:border-white/10 rounded-full pl-11 pr-10 py-3 text-sm text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be] placeholder:text-[#424754]/50 dark:placeholder:text-gray-500"
        />
        <span className="material-symbols-outlined absolute left-4 top-3 text-[#424754] dark:text-gray-400 text-[20px]">search</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 p-1 rounded-full text-slate-400 hover:text-[#0058be]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Segmented Mode Switcher (hidden while searching) */}
      {!searchQuery && (
      <div className="mb-4">
        <div className="inline-flex items-center gap-1 p-1 rounded-full glass-card border border-white/60 dark:border-white/10 shadow-sm relative">
          {mode === 'feed' && (
            <motion.div
              layoutId="explore-mode-pill"
              className="absolute inset-y-1 left-1 w-[88px] rounded-full bg-gradient-to-r from-[#2170e4] to-[#0058be] shadow-md"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          {mode === 'cards' && (
            <motion.div
              layoutId="explore-mode-pill"
              className="absolute inset-y-1 right-1 w-[88px] rounded-full bg-gradient-to-r from-[#2170e4] to-[#0058be] shadow-md"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <button
            onClick={() => onModeChange('feed')}
            className={`relative z-10 w-[88px] py-2 rounded-full text-xs font-bold transition-colors ${
              mode === 'feed' ? 'text-white' : 'text-[#424754] dark:text-gray-300'
            }`}
          >
            瀑布流
          </button>
          <button
            onClick={() => onModeChange('cards')}
            className={`relative z-10 w-[88px] py-2 rounded-full text-xs font-bold transition-colors ${
              mode === 'cards' ? 'text-white' : 'text-[#424754] dark:text-gray-300'
            }`}
          >
            卡片滑动
          </button>
        </div>
      </div>
      )}

      {/* Search result hint */}
      {searchQuery && (
        <p className="text-xs text-[#424754] dark:text-gray-400 mb-3">
          找到 {searchedPosts.length} 条与「{searchQuery}」相关的灵感
        </p>
      )}

      {/* Mode Content with animated transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={searchQuery ? `search-${searchQuery}` : mode}
          variants={modeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {searchQuery || mode === 'feed' ? (
            <DiscoveryFeedView
              posts={searchedPosts}
              onSelectPost={onSelectPost}
              onToggleLike={onToggleLike}
              onToggleSave={onToggleSave}
              embedded
              hideHero={!!searchQuery}
            />
          ) : (
            <ExploreSwipeView
              cards={cards}
              onSelectPost={onSelectPost}
              onOpenMessagesWithAuthor={onOpenMessagesWithAuthor}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

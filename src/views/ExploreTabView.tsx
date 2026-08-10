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

  return (
    <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-[1440px] mx-auto">
      {/* Segmented Mode Switcher */}
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

      {/* Mode Content with animated transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={modeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {mode === 'feed' ? (
            <DiscoveryFeedView
              posts={posts}
              onSelectPost={onSelectPost}
              onToggleLike={onToggleLike}
              onToggleSave={onToggleSave}
              embedded
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

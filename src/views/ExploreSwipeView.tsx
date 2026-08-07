import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { PostItem } from '../types';

interface ExploreSwipeViewProps {
  cards: PostItem[];
  onSelectPost: (post: PostItem) => void;
  onOpenMessagesWithAuthor?: (authorName: string) => void;
}

// Direction: 1 = swipe right (like), -1 = swipe left (pass)
// Outer layer handles enter/exit flight; inner layer handles drag.
const flightVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 340 : -340,
    scale: 0.92,
    opacity: 0,
  }),
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? 540 : -540,
    scale: 0.9,
    opacity: 0,
  }),
};

const flightTransition = {
  x: { type: 'spring', stiffness: 260, damping: 27, mass: 0.85 },
  scale: { type: 'spring', stiffness: 260, damping: 25 },
  opacity: { duration: 0.2, ease: 'easeOut' },
};

type SwipeMode = 'next' | 'like';

export const ExploreSwipeView: React.FC<ExploreSwipeViewProps> = ({
  cards,
  onSelectPost,
  onOpenMessagesWithAuthor,
}) => {
  const [[currentIndex, direction], setPage] = useState<[number, number]>([0, 0]);
  const [lastAction, setLastAction] = useState<'like' | 'pass' | null>(null);
  // next mode: swipe either direction to browse forward
  // like mode: swipe right = like, swipe left = pass
  const [swipeMode, setSwipeMode] = useState<SwipeMode>('like');

  // Drag motion values live on the INNER card only,
  // so they never conflict with the OUTER enter/exit flight animation.
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-14, 14]);
  const likeBadgeOpacity = useTransform(x, [50, 130], [0, 1]);
  const passBadgeOpacity = useTransform(x, [-130, -50], [1, 0]);

  // Background card rises smoothly as the top card is dragged away
  // dragProgress: 0 at rest, 1 when dragged far in either direction
  const dragProgress = useTransform(x, [-240, 0, 240], [1, 0, 1]);
  const nextScale = useTransform(dragProgress, [0, 1], [0.93, 1]);
  const nextOpacity = useTransform(dragProgress, [0, 1], [0.5, 0.85]);
  const nextBadgeOpacity = useTransform(dragProgress, [0.15, 0.8], [0, 1]);

  const currentCard = cards[currentIndex % cards.length];
  const nextCard = cards[(currentIndex + 1) % cards.length];

  const swipeTo = (dir: number) => {
    if (swipeMode === 'like') {
      setLastAction(dir > 0 ? 'like' : 'pass');
      setTimeout(() => setLastAction(null), 650);
    }
    setPage(([i]) => [i + 1, dir]);
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const offsetThreshold = 90;
    const velocityThreshold = 420;
    const passed =
      Math.abs(info.offset.x) > offsetThreshold || Math.abs(info.velocity.x) > velocityThreshold;
    if (!passed) return; // Below threshold: dragSnapToOrigin springs the card back smoothly

    if (swipeMode === 'next') {
      // Either direction simply advances to the next card
      swipeTo(info.offset.x < 0 ? -1 : 1);
    } else if (info.offset.x > offsetThreshold || info.velocity.x > velocityThreshold) {
      swipeTo(1);
    } else {
      swipeTo(-1);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="font-headline text-2xl font-bold text-[#0b1c30] dark:text-white">Explore</h2>
          <p className="text-xs text-[#424754] dark:text-gray-300">Daily curated inspirations</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Swipe Mode Switcher: next (browse) / like */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setSwipeMode('next')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                swipeMode === 'next'
                  ? 'bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white shadow-sm'
                  : 'text-[#424754] dark:text-gray-300'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => setSwipeMode('like')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                swipeMode === 'like'
                  ? 'bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white shadow-sm'
                  : 'text-[#424754] dark:text-gray-300'
              }`}
            >
              Like
            </button>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#2170e4]/15 text-[#0058be] dark:text-[#adc6ff]">
            {(currentIndex % cards.length) + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Swipe Deck Container */}
      <div className="relative w-full h-[520px] md:h-[580px] flex items-center justify-center">
        {/* Next Card Background - scales up live as the top card is dragged */}
        {nextCard && (
          <motion.div
            key={`next_${currentIndex}`}
            style={{ scale: nextScale, opacity: nextOpacity }}
            className="absolute inset-0 rounded-3xl overflow-hidden glass-panel pointer-events-none shadow-sm"
          >
            <img
              src={nextCard.imageUrl}
              alt={nextCard.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        )}

        {/* Current Active Card: outer = flight (enter/exit), inner = drag */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {currentCard && (
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={flightVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={flightTransition}
              className="absolute inset-0"
            >
              <motion.div
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.85}
                dragSnapToOrigin
                dragTransition={{ bounceStiffness: 320, bounceDamping: 26 }}
                onDragEnd={handleDragEnd}
                className="w-full h-full rounded-3xl overflow-hidden glass-panel shadow-2xl cursor-grab active:cursor-grabbing border border-white/60 dark:border-white/10"
              >
                <div className="relative w-full h-full">
                  <img
                    src={currentCard.imageUrl}
                    alt={currentCard.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* LIKE / PASS drag feedback badges (like mode only) */}
                  {swipeMode === 'like' && (
                    <>
                      <motion.div
                        style={{ opacity: likeBadgeOpacity }}
                        className="absolute top-8 left-6 z-20 px-4 py-1.5 rounded-xl border-2 border-emerald-400 text-emerald-300 font-headline font-bold text-lg rotate-[-12deg] bg-emerald-500/20 backdrop-blur-sm pointer-events-none"
                      >
                        LIKE
                      </motion.div>
                      <motion.div
                        style={{ opacity: passBadgeOpacity }}
                        className="absolute top-8 right-6 z-20 px-4 py-1.5 rounded-xl border-2 border-red-400 text-red-300 font-headline font-bold text-lg rotate-[12deg] bg-red-500/20 backdrop-blur-sm pointer-events-none"
                      >
                        PASS
                      </motion.div>
                    </>
                  )}
                  {/* NEXT mode hint badge */}
                  {swipeMode === 'next' && (
                    <motion.div
                      style={{ opacity: nextBadgeOpacity }}
                      className="absolute top-8 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-xl border-2 border-sky-400 text-sky-300 font-headline font-bold text-lg bg-sky-500/20 backdrop-blur-sm pointer-events-none"
                    >
                      NEXT
                    </motion.div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/95 via-[#0b1c30]/40 to-transparent flex flex-col justify-between p-6">
                    {/* Top Badge */}
                    <div className="flex justify-between items-center">
                      <span className="px-3.5 py-1 rounded-full bg-white/30 backdrop-blur-md text-white text-xs font-medium">
                        {currentCard.category}
                      </span>
                      <button
                        onClick={() => onSelectPost(currentCard)}
                        className="p-2 bg-white/30 backdrop-blur-md text-white rounded-full hover:bg-white/50 transition-colors"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                      </button>
                    </div>

                    {/* Bottom Content overlay */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={currentCard.author.avatar}
                          alt={currentCard.author.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/80"
                        />
                        <div>
                          <h4 className="text-white font-bold text-sm leading-tight">
                            {currentCard.author.name}
                          </h4>
                          <p className="text-white/80 text-xs">{currentCard.date || 'Creator'}</p>
                        </div>
                      </div>

                      <h3 className="font-headline text-2xl font-bold text-white mb-2">
                        {currentCard.title}
                      </h3>
                      <p className="text-white/90 text-xs line-clamp-2 leading-relaxed mb-4">
                        {currentCard.content}
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        {currentCard.tags.map((t, idx) => (
                          <span key={idx} className="text-[11px] text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action feedback burst */}
        <AnimatePresence>
          {lastAction && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1.15, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <span
                className={`material-symbols-outlined text-[110px] drop-shadow-2xl ${
                  lastAction === 'like' ? 'text-[#fc79bd]' : 'text-slate-300'
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {lastAction === 'like' ? 'favorite' : 'close'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe Controls Bar */}
      <div className="flex items-center justify-center gap-6 mt-8">
        {swipeMode === 'like' ? (
          <button
            onClick={() => swipeTo(-1)}
            className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
            title="Pass"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        ) : (
          <button
            onClick={() => swipeTo(-1)}
            className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 text-[#424754] dark:text-gray-300 hover:text-[#0058be] hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
            title="Previous Direction"
          >
            <span className="material-symbols-outlined text-[28px]">chevron_left</span>
          </button>
        )}

        <button
          onClick={() => onSelectPost(currentCard)}
          className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 text-[#0058be] hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          title="Open Article"
        >
          <span className="material-symbols-outlined text-[22px]">visibility</span>
        </button>

        <button
          onClick={() => {
            if (onOpenMessagesWithAuthor) {
              onOpenMessagesWithAuthor(currentCard.author.name);
            }
          }}
          className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 text-[#2170e4] hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
          title="Send Direct Message"
        >
          <span className="material-symbols-outlined text-[22px]">chat</span>
        </button>

        {swipeMode === 'like' ? (
          <button
            onClick={() => swipeTo(1)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-[#2170e4] to-[#0058be] shadow-lg text-white hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
            title="Love"
          >
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
          </button>
        ) : (
          <button
            onClick={() => swipeTo(1)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-[#2170e4] to-[#0058be] shadow-lg text-white hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
            title="Next"
          >
            <span className="material-symbols-outlined text-[28px]">chevron_right</span>
          </button>
        )}
      </div>
    </div>
  );
};

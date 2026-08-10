import React, { useState, useMemo, useRef } from 'react';
import { PostItem } from '../types';
import { FALLBACK_IMG } from '../constants';
import { useApp } from '../context/AppContext';

interface DiscoveryFeedViewProps {
  posts: PostItem[];
  onSelectPost: (post: PostItem) => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  embedded?: boolean;
  hideHero?: boolean;
}

const PAGE_SIZE = 6;

// Tag chip with long-press to favorite: wiggle animation then star icon
const TagChip: React.FC<{
  postId: string;
  tag: string;
  isFav: boolean;
  onToggleFav: (key: string) => void;
}> = ({ postId, tag, isFav, onToggleFav }) => {
  const [wiggling, setWiggling] = useState(false);
  const timer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const handlePointerDown = () => {
    longPressed.current = false;
    clearTimer();
    timer.current = window.setTimeout(() => {
      longPressed.current = true;
      setWiggling(true);
      window.setTimeout(() => {
        setWiggling(false);
        onToggleFav(`${postId}:${tag}`);
      }, 400);
    }, 450);
  };

  return (
    <span
      onPointerDown={handlePointerDown}
      onPointerUp={clearTimer}
      onPointerLeave={clearTimer}
      onPointerCancel={clearTimer}
      onClick={(e) => {
        if (longPressed.current) {
          e.stopPropagation();
          longPressed.current = false;
        }
      }}
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#eff4ff] dark:bg-slate-700/60 text-[#424754] dark:text-gray-300 text-[10px] font-medium select-none ${
        wiggling ? 'tag-wiggle' : ''
      }`}
    >
      {tag}
      {isFav && (
        <span
          className="material-symbols-outlined text-[11px] text-amber-400"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      )}
    </span>
  );
};

export const DiscoveryFeedView: React.FC<DiscoveryFeedViewProps> = ({
  posts,
  onSelectPost,
  onToggleLike,
  onToggleSave,
  embedded = false,
  hideHero = false,
}) => {
  const { showToast, refreshPosts, favTags, toggleFavTag } = useApp();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh (touch)
  const touchStartY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0) touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && window.scrollY <= 0) setPullDistance(Math.min(delta * 0.45, 90));
  };
  const handleTouchEnd = async () => {
    const shouldRefresh = pullDistance > 60;
    touchStartY.current = null;
    setPullDistance(0);
    if (shouldRefresh && !refreshing) {
      setRefreshing(true);
      try {
        await refreshPosts();
        showToast('已为你更新灵感', 'success');
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulated network latency for a natural pagination feel
    setTimeout(() => {
      setVisibleCount((c) => c + PAGE_SIZE);
      setLoadingMore(false);
    }, 500);
  };

  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);

  const handleFavTag = (key: string) => {
    const wasFav = favTags.includes(key);
    toggleFavTag(key);
    showToast(wasFav ? '已取消收藏标签' : '标签已收藏，可在关注页查看', 'success');
  };

  return (
    <div
      className={embedded ? 'w-full' : 'w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-[1440px] mx-auto'}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div className="flex justify-center items-center transition-all" style={{ height: refreshing ? 48 : pullDistance }}>
          <span className={`material-symbols-outlined text-[24px] text-[#0058be] ${refreshing ? 'animate-spin' : ''}`}
            style={{ opacity: refreshing ? 1 : Math.min(pullDistance / 60, 1) }}>
            {refreshing ? 'progress_activity' : 'arrow_downward'}
          </span>
        </div>
      )}

      {/* Hero Section: Daily Muse */}
      {!hideHero && posts.length > 0 && (
      <section className="relative w-full h-[360px] md:h-[480px] rounded-3xl overflow-hidden shadow-sm mb-10 group">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRShvSxNnFUt-ltwj3j1JzEES_Q0uuHxBfqNpldvleO3-NFh-fvCs8bluldnlWS1wwogPD78Gs_izc2VkdM400e5Lk3ZAKXwC7hZo7JY7FGs8YC24bsY6sZzR1acgUgD_bAKLvG_Aqs9_VXTSRS0Yj58U3IBGTfBLb-1DpI_4cW-2N0OU04K8R7E4OYqOgJ6cFlYTnWo8Ky80GDz_O2S-fnMxEzir_z_T6DB8w1VXGsrY0_YjbhgkNOQ"
          alt="Daily Muse Hero"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/90 via-[#0b1c30]/30 to-transparent flex flex-col justify-end p-6 md:p-10">
          <div className="glass-panel p-6 md:p-8 rounded-2xl md:max-w-2xl backdrop-blur-2xl">
            <span className="inline-block px-3.5 py-1 bg-[#2170e4] text-white rounded-full text-xs font-semibold mb-3">
              Daily Muse
            </span>
            <h2 className="font-headline text-2xl md:text-4xl font-bold text-[#0b1c30] dark:text-white mb-2">
              Modern Minimalism
            </h2>
            <p className="text-sm md:text-base text-[#424754] dark:text-gray-200 leading-relaxed mb-4">
              Explore the beauty of simplicity. Today's curation focuses on clean lines, negative space, and the profound impact of minimal design in urban environments.
            </p>
            <button
              onClick={() => onSelectPost(posts[2] || posts[0])}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0058be] dark:text-[#adc6ff] hover:underline"
            >
              <span>Read Curation</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
      )}

      {/* Empty state (e.g. no search results) */}
      {posts.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center text-[#424754] dark:text-gray-300">
          <span className="material-symbols-outlined text-[48px] text-slate-400 mb-2 block">search_off</span>
          <p className="font-headline text-lg font-bold">没有找到相关灵感</p>
          <p className="text-xs mt-1">换个关键词试试，或去探索页看看今日精选</p>
        </div>
      )}

      {/* Waterfall Grid */}
      <div className="waterfall-container">
        {visiblePosts.map((post) => {
          if (post.type === 'quote' || post.quote) {
            return (
              <div key={post.id} className="waterfall-item">
                <div
                  onClick={() => onSelectPost(post)}
                  className="glass-card rounded-2xl p-6 cursor-pointer group hover:-translate-y-1.5 transition-all duration-300 shadow-sm"
                >
                  <div className="bg-[#e8ddff]/50 dark:bg-purple-900/30 rounded-xl p-5 mb-4 flex items-center justify-center text-[#6448b3]">
                    <span className="material-symbols-outlined text-[42px]">format_quote</span>
                  </div>
                  <h3 className="font-headline text-lg md:text-xl font-bold text-[#0b1c30] dark:text-white leading-snug mb-4">
                    {post.quote || post.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-[#424754] dark:text-gray-300">
                    <span className="font-semibold">{post.author.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(post.id);
                      }}
                      className="flex items-center gap-1 hover:text-[#a43073] transition-colors"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      <span>{post.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={post.id} className="waterfall-item">
              <div
                onClick={() => onSelectPost(post)}
                className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:-translate-y-1.5 transition-all duration-300 shadow-sm flex flex-col"
              >
                {post.imageUrl && (
                  <div className="relative overflow-hidden p-2">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                      className="w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-105 max-h-[380px]"
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(post.id);
                      }}
                      className="absolute top-4 right-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-full p-2 text-[#0058be] hover:scale-110 active:scale-95 transition-all"
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: post.isSaved ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        bookmark
                      </span>
                    </button>
                  </div>
                )}

                <div className="p-4 pt-2 flex flex-col flex-1">
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {post.tags.slice(0, 2).map((t, idx) => (
                        <TagChip
                          key={idx}
                          postId={post.id}
                          tag={t}
                          isFav={favTags.includes(`${post.id}:${t}`)}
                          onToggleFav={handleFavTag}
                        />
                      ))}
                    </div>
                  )}

                  <h3 className="font-headline text-base md:text-lg font-semibold leading-tight text-[#0b1c30] dark:text-white mb-3">
                    {post.title}
                  </h3>

                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                        className="w-6 h-6 rounded-full object-cover border border-white"
                      />
                      <span className="text-xs text-[#424754] dark:text-gray-300 font-medium truncate max-w-[90px]">
                        {post.author.name}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(post.id);
                      }}
                      className="flex items-center gap-1 text-xs text-[#424754] dark:text-gray-300 hover:text-[#a43073] transition-colors"
                    >
                      <span
                        className="material-symbols-outlined text-[16px] text-[#a43073]"
                        style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      <span>{post.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More with pagination */}
      {visibleCount < posts.length && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="glass-button text-[#424754] dark:text-gray-200 font-medium px-8 py-3 rounded-full hover:bg-white/80 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>加载中…</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </>
            )}
          </button>
        </div>
      )}
      {visibleCount >= posts.length && posts.length > PAGE_SIZE && (
        <p className="mt-10 text-center text-[11px] text-[#424754]/60 dark:text-gray-500">
          —— 今天的灵感都看完啦 ✨ ——
        </p>
      )}
    </div>
  );
};

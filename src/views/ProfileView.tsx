import React, { useState } from 'react';
import { User, PostItem } from '../types';
import { useApp } from '../context/AppContext';
import { InspirationCalendar } from '../components/InspirationCalendar';

interface ProfileViewProps {
  user: User;
  userPosts: PostItem[];
  onOpenEditProfile: () => void;
  onOpenSettings: () => void;
  onSelectPost: (post: PostItem) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  userPosts,
  onOpenEditProfile,
  onOpenSettings,
  onSelectPost,
}) => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'appreciated'>('posts');

  const handleShareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${user.name}'s Profile`, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Profile link copied!', 'success');
      }
    } catch {
      // user cancelled
    }
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-[1200px] mx-auto">
      {/* Profile Info Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleShareProfile}
          className="glass-button p-2.5 rounded-full text-[#424754] dark:text-gray-200 hover:text-[#0058be]"
          title="Share Profile"
        >
          <span className="material-symbols-outlined text-[20px]">share</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="glass-button p-2.5 rounded-full text-[#424754] dark:text-gray-200 hover:text-[#0058be]"
          title="Settings"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>

      {/* Profile Info Header */}
      <div className="glass-panel rounded-3xl p-6 md:p-10 mb-8 border border-white/60 dark:border-white/10 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
        <div className="relative group shrink-0">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-[#0058be] via-[#2170e4] to-[#fc79bd] shadow-lg">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-800"
            />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold text-[#0b1c30] dark:text-white">
                {user.name}
              </h2>
              <p className="text-xs md:text-sm text-[#424754] dark:text-gray-300 font-medium">
                {user.handle}
              </p>
            </div>

            <div className="flex justify-center md:justify-start gap-3">
              <button
                onClick={onOpenEditProfile}
                className="glass-button px-5 py-2 rounded-full text-xs font-semibold text-[#0058be] dark:text-[#adc6ff] hover:bg-white/80 active:scale-95 transition-all"
              >
                Edit Profile
              </button>
            </div>
          </div>

          <p className="text-xs md:text-sm text-[#424754] dark:text-gray-200 leading-relaxed max-w-xl mb-6">
            {user.bio}
          </p>

          {/* Stats Bar */}
          <div className="flex justify-around md:justify-start md:gap-12 py-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="text-center md:text-left">
              <span className="block font-headline text-lg font-bold text-[#0b1c30] dark:text-white">
                {user.postsCount}
              </span>
              <span className="text-[11px] text-[#424754] dark:text-gray-400 uppercase tracking-wider">
                Posts
              </span>
            </div>

            <div className="text-center md:text-left">
              <span className="block font-headline text-lg font-bold text-[#0b1c30] dark:text-white">
                {user.followersCount}
              </span>
              <span className="text-[11px] text-[#424754] dark:text-gray-400 uppercase tracking-wider">
                Followers
              </span>
            </div>

            <div className="text-center md:text-left">
              <span className="block font-headline text-lg font-bold text-[#0b1c30] dark:text-white">
                {user.followingCount}
              </span>
              <span className="text-[11px] text-[#424754] dark:text-gray-400 uppercase tracking-wider">
                Following
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inspiration Calendar - GitHub style activity heatmap */}
      <InspirationCalendar />

      {/* Tabs */}
      <div className="flex justify-center border-b border-slate-200 dark:border-slate-700 mb-8">
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 px-6 text-sm font-semibold transition-all relative ${
            activeTab === 'posts'
              ? 'text-[#0058be] dark:text-[#adc6ff]'
              : 'text-[#424754] dark:text-gray-400 hover:text-[#0058be]'
          }`}
        >
          <span>Posts</span>
          {activeTab === 'posts' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0058be] dark:bg-[#adc6ff] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-6 text-sm font-semibold transition-all relative ${
            activeTab === 'saved'
              ? 'text-[#0058be] dark:text-[#adc6ff]'
              : 'text-[#424754] dark:text-gray-400 hover:text-[#0058be]'
          }`}
        >
          <span>Saved</span>
          {activeTab === 'saved' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0058be] dark:bg-[#adc6ff] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('appreciated')}
          className={`pb-3 px-6 text-sm font-semibold transition-all relative ${
            activeTab === 'appreciated'
              ? 'text-[#0058be] dark:text-[#adc6ff]'
              : 'text-[#424754] dark:text-gray-400 hover:text-[#0058be]'
          }`}
        >
          <span>Appreciated</span>
          {activeTab === 'appreciated' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0058be] dark:bg-[#adc6ff] rounded-full" />
          )}
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {userPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="group relative aspect-square rounded-2xl overflow-hidden glass-card cursor-pointer shadow-sm hover:shadow-md transition-all"
          >
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full p-4 bg-gradient-to-tr from-purple-100 to-blue-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-center">
                <p className="font-headline text-xs font-bold text-[#0b1c30] dark:text-white line-clamp-3">
                  {post.title}
                </p>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
              <span className="text-xs font-bold truncate">{post.title}</span>
              <div className="flex items-center gap-1 text-[11px] text-white/80 mt-1">
                <span className="material-symbols-outlined text-[14px]">favorite</span>
                <span>{post.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

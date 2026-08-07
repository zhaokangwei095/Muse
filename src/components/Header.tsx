import React from 'react';
import { NavTab } from '../types';

interface HeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  isMobile: boolean;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  isMobile,
  onOpenMenu,
}) => {
  if (isMobile) {
    return (
      <header className="fixed top-0 left-0 w-full z-50 bg-white/75 dark:bg-[#0b1c30]/75 backdrop-blur-xl border-b border-white/40 dark:border-white/10 shadow-xs flex items-center justify-between px-6 h-16 transition-colors">
        <button
          onClick={onOpenMenu}
          className="text-[#0058be] dark:text-[#adc6ff] hover:opacity-80 transition-opacity active:scale-95 p-1"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <h1
          onClick={() => onTabChange('discovery')}
          className="font-headline text-2xl font-bold tracking-tight text-[#0058be] dark:text-[#adc6ff] cursor-pointer"
        >
          Muse
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDarkMode}
            className="text-[#0058be] dark:text-[#adc6ff] p-1 hover:opacity-80 active:scale-95"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="text-[#0058be] dark:text-[#adc6ff] p-1 hover:opacity-80 active:scale-95"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <nav className="flex fixed top-0 left-0 w-full z-50 bg-white/75 dark:bg-[#0b1c30]/75 backdrop-blur-xl border-b border-white/40 dark:border-white/10 shadow-xs items-center justify-between px-10 h-20 transition-colors">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onTabChange('discovery')}>
          <button className="text-[#0058be] dark:text-[#adc6ff] hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-[28px]">bubble_chart</span>
          </button>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-[#0058be] dark:text-[#adc6ff]">
            Muse
          </h1>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={() => onTabChange('discovery')}
            className={`flex flex-col items-center justify-center font-medium text-sm transition-all ${
              currentTab === 'discovery'
                ? 'text-[#0058be] dark:text-[#adc6ff] font-bold'
                : 'text-[#424754] dark:text-gray-300 hover:text-[#0058be]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: currentTab === 'discovery' ? "'FILL' 1" : "'FILL' 0" }}>
              auto_awesome
            </span>
            <span>Discovery</span>
          </button>

          <button
            onClick={() => onTabChange('explore')}
            className={`flex flex-col items-center justify-center font-medium text-sm transition-all ${
              currentTab === 'explore'
                ? 'text-[#0058be] dark:text-[#adc6ff] font-bold'
                : 'text-[#424754] dark:text-gray-300 hover:text-[#0058be]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: currentTab === 'explore' ? "'FILL' 1" : "'FILL' 0" }}>
              explore
            </span>
            <span>Explore</span>
          </button>

          <button
            onClick={() => onTabChange('create')}
            className="flex items-center gap-2 text-[#0058be] dark:text-[#adc6ff] bg-[#2170e4]/15 dark:bg-[#2170e4]/30 rounded-xl px-4 py-2 font-semibold text-sm hover:bg-[#2170e4]/25 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              add_circle
            </span>
            <span>Create</span>
          </button>

          <button
            onClick={() => onTabChange('bookmarks')}
            className={`flex flex-col items-center justify-center font-medium text-sm transition-all ${
              currentTab === 'bookmarks'
                ? 'text-[#0058be] dark:text-[#adc6ff] font-bold'
                : 'text-[#424754] dark:text-gray-300 hover:text-[#0058be]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: currentTab === 'bookmarks' ? "'FILL' 1" : "'FILL' 0" }}>
              bookmarks
            </span>
            <span>Bookmarks</span>
          </button>

          <button
            onClick={() => onTabChange('messages')}
            className={`flex flex-col items-center justify-center font-medium text-sm transition-all ${
              currentTab === 'messages'
                ? 'text-[#0058be] dark:text-[#adc6ff] font-bold'
                : 'text-[#424754] dark:text-gray-300 hover:text-[#0058be]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: currentTab === 'messages' ? "'FILL' 1" : "'FILL' 0" }}>
              chat_bubble
            </span>
            <span>Messages</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center justify-center font-medium text-sm transition-all ${
              currentTab === 'profile'
                ? 'text-[#0058be] dark:text-[#adc6ff] font-bold'
                : 'text-[#424754] dark:text-gray-300 hover:text-[#0058be]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px] mb-0.5" style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>
              person
            </span>
            <span>Profile</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-[#0058be] dark:text-[#adc6ff] hover:bg-white/40 dark:hover:bg-white/10 rounded-full transition-all active:scale-95"
            title="Toggle theme"
          >
            <span className="material-symbols-outlined text-[24px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-[#0058be] dark:text-[#adc6ff] hover:bg-white/40 dark:hover:bg-white/10 rounded-full transition-all active:scale-95"
            title="Settings"
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
          </button>
        </div>
      </nav>
  );
};

import React from 'react';
import { NavTab } from '../types';

interface BottomNavBarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const NAV_ITEMS: Array<{ tab: NavTab; icon: string; label: string }> = [
  { tab: 'explore', icon: 'explore', label: '探索' },
  { tab: 'bookmarks', icon: 'favorite', label: '关注' },
  { tab: 'messages', icon: 'chat_bubble', label: '聊天' },
  { tab: 'profile', icon: 'person', label: '我' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-36px)] max-w-md rounded-full bg-white/75 dark:bg-[#0b1c30]/85 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-xl flex justify-around items-center py-2 px-3 z-50 transition-all">
      {NAV_ITEMS.map((item) => {
        const isActive = currentTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => onTabChange(item.tab)}
            aria-label={item.label}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all active:scale-95 ${
              isActive
                ? 'bg-[#2170e4]/15 text-[#0058be] dark:text-[#adc6ff] font-bold'
                : 'text-[#424754]/80 dark:text-gray-300'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="text-[10px] tracking-wide mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

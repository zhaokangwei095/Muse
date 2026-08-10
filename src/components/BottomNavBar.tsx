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
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-[#0b1c30]/95 backdrop-blur-2xl border-t border-white/50 dark:border-white/10 shadow-[0_-6px_24px_rgba(11,28,48,0.08)] flex justify-around items-center px-2 pt-1.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] transition-all">
      {NAV_ITEMS.map((item) => {
        const isActive = currentTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => onTabChange(item.tab)}
            aria-label={item.label}
            className={`relative flex flex-col items-center justify-center px-5 py-1.5 rounded-2xl transition-all active:scale-95 ${
              isActive
                ? 'text-[#0058be] dark:text-[#adc6ff] font-bold'
                : 'text-[#424754]/70 dark:text-gray-400'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-gradient-to-r from-[#2170e4] to-[#0058be]" />
            )}
            <span
              className="material-symbols-outlined text-[24px]"
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

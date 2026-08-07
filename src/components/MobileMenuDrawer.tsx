import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavTab, User } from '../types';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const MENU_ITEMS: Array<{ tab: NavTab; icon: string; label: string; desc: string }> = [
  { tab: 'explore', icon: 'explore', label: '探索', desc: '瀑布流与灵感卡片' },
  { tab: 'bookmarks', icon: 'favorite', label: '关注', desc: '收藏的帖子与灵感' },
  { tab: 'messages', icon: 'chat_bubble', label: '聊天', desc: '与创作者对话' },
  { tab: 'profile', icon: 'person', label: '我', desc: '个人主页与作品' },
  { tab: 'create', icon: 'add_circle', label: '发布灵感', desc: 'AI 辅助创作' },
  { tab: 'settings', icon: 'settings', label: '设置', desc: '主题与偏好' },
];

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  user,
  currentTab,
  onTabChange,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const handleTab = (tab: NavTab) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 z-[70] h-full w-[300px] max-w-[85vw] glass-panel border-r border-white/60 dark:border-white/10 shadow-2xl flex flex-col bg-white/90 dark:bg-[#0e2036]/95"
          >
            {/* User Header */}
            <div className="p-6 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline text-xl font-bold text-[#0058be] dark:text-[#adc6ff]">
                  Muse
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-[#424754] dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {user && (
                <button
                  onClick={() => handleTab('profile')}
                  className="flex items-center gap-3 w-full p-2 -m-2 rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-[#0058be] via-[#2170e4] to-[#fc79bd] shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-800"
                    />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-headline font-bold text-sm text-[#0b1c30] dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-[#424754] dark:text-gray-400 truncate">
                      {user.handle}
                    </p>
                  </div>
                </button>
              )}
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {MENU_ITEMS.map((item) => {
                const isActive = currentTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => handleTab(item.tab)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#2170e4]/15 text-[#0058be] dark:text-[#adc6ff]'
                        : 'text-[#0b1c30] dark:text-gray-200 hover:bg-white/60 dark:hover:bg-white/10'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm leading-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] text-[#424754] dark:text-gray-400 truncate">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Footer: Theme Toggle */}
            <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={onToggleDarkMode}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 text-[#0b1c30] dark:text-gray-200 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-sm font-semibold">
                  <span className="material-symbols-outlined text-[20px]">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  {isDarkMode ? '浅色模式' : '深色模式'}
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#424754] dark:text-gray-400">
                  chevron_right
                </span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

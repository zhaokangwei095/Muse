import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  like: { icon: 'favorite', color: 'text-[#a43073]' },
  comment: { icon: 'chat_bubble', color: 'text-[#2170e4]' },
  reply: { icon: 'reply', color: 'text-[#7c3aed]' },
  follow: { icon: 'person_add', color: 'text-[#10b981]' },
};

function timeAgo(createdAt: string): string {
  const then = new Date(createdAt.replace(' ', 'T') + (createdAt.includes('T') ? '' : 'Z'));
  const diff = Math.max(0, Date.now() - then.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPost: (postId: string) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose, onOpenPost }) => {
  const { notifications, unreadCount, markNotificationsRead } = useApp();

  // Mark all as read shortly after opening
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      const timer = setTimeout(() => markNotificationsRead(), 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, unreadCount, markNotificationsRead]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-32px)] max-w-md glass-panel rounded-3xl border border-white/60 dark:border-white/15 shadow-2xl overflow-hidden bg-white/95 dark:bg-[#0e2036]/95"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#0058be]">notifications</span>
                通知
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/60 dark:hover:bg-white/10 text-[#424754] dark:text-gray-300">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto no-scrollbar p-2.5 space-y-1.5">
              {notifications.length === 0 && (
                <div className="py-10 text-center text-[#424754] dark:text-gray-400">
                  <span className="material-symbols-outlined text-[36px] text-slate-300 dark:text-slate-600 block mb-2">notifications_none</span>
                  <p className="text-xs">暂无通知，去探索页逛逛吧</p>
                </div>
              )}
              {notifications.map((n) => {
                const meta = TYPE_ICON[n.type] || TYPE_ICON.like;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (n.postId) {
                        onOpenPost(n.postId);
                        onClose();
                      }
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-colors ${
                      n.postId ? 'hover:bg-white/70 dark:hover:bg-white/10 cursor-pointer' : 'cursor-default'
                    } ${n.isRead ? 'opacity-60' : ''}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 ${meta.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {meta.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#0b1c30] dark:text-gray-100 leading-relaxed">
                        <span className="font-bold">{n.actorName}</span> {n.text}
                      </p>
                      <p className="text-[10px] text-[#424754]/60 dark:text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

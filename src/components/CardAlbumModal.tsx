import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlbumCard } from '../types';
import { useApp } from '../context/AppContext';

const ALBUM_KEY = 'muse-card-album';

export function loadAlbum(): AlbumCard[] {
  try { return JSON.parse(localStorage.getItem(ALBUM_KEY) || '[]'); } catch { return []; }
}

export function saveToAlbum(card: AlbumCard): void {
  const album = loadAlbum();
  localStorage.setItem(ALBUM_KEY, JSON.stringify([card, ...album].slice(0, 60)));
}

export const CardAlbumModal: React.FC = () => {
  const { cardAlbumOpen, setCardAlbumOpen, showToast } = useApp();
  const [cards, setCards] = useState<AlbumCard[]>(loadAlbum);

  const refresh = useCallback(() => setCards(loadAlbum()), []);

  const removeCard = (id: string) => {
    const next = loadAlbum().filter((c) => c.id !== id);
    localStorage.setItem(ALBUM_KEY, JSON.stringify(next));
    refresh();
    showToast('已从卡册移除', 'info');
  };

  return (
    <AnimatePresence>
      {cardAlbumOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCardAlbumOpen(false)}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-4 top-[8vh] bottom-[8vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-[85] glass-panel rounded-3xl border border-white/60 dark:border-white/20 shadow-2xl flex flex-col overflow-hidden bg-white/95 dark:bg-[#0e2036]/95"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#7c3aed]">collections_bookmark</span>
                我的灵感卡册
                <span className="text-[10px] font-normal text-[#424754] dark:text-gray-400">{cards.length} 张</span>
              </h3>
              <button onClick={() => setCardAlbumOpen(false)} className="p-1.5 rounded-full hover:bg-white/60 dark:hover:bg-white/10 text-[#424754] dark:text-gray-300">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
              {cards.length === 0 ? (
                <div className="py-16 text-center text-[#424754] dark:text-gray-400">
                  <span className="material-symbols-outlined text-[44px] text-slate-300 dark:text-slate-600 block mb-3">style</span>
                  <p className="text-sm font-bold mb-1">卡册还是空的</p>
                  <p className="text-xs">去「灵感抽卡」收集属于你的心境卡吧</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-2xl p-3.5 border border-white/50 dark:border-white/10 shadow-sm relative group"
                      style={{ background: `linear-gradient(150deg, ${card.gradient.includes('radial') ? '#eff4ff' : '#eff4ff'}, #ffffff)` }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-4 h-4 rounded-full border border-white/80 shrink-0" style={{ background: card.gradient }} />
                        <span className="text-[10px] font-bold text-[#0058be] dark:text-[#2170e4]">{card.colorName}色灵感卡</span>
                      </div>
                      <p className="font-headline text-xs font-bold text-[#0b1c30] dark:text-[#0b1c30] leading-snug mb-1.5 line-clamp-2">
                        {card.title}
                      </p>
                      <p className="text-[10px] text-[#424754] leading-relaxed line-clamp-3 mb-2">{card.text}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-[#424754]/60">{card.savedAt.slice(0, 10)}</span>
                        <button
                          onClick={() => removeCard(card.id)}
                          className="p-1 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                          title="移除"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

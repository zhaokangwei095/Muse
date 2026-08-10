import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

// Downscale & compress a local image so it can be stored as a data URL
function compressImage(file: File, maxSize = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas unsupported'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('invalid image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

// WeChat-style plus panel actions
const PLUS_ACTIONS: Array<{ id: string; icon: string; label: string }> = [
  { id: 'album', icon: 'photo_library', label: '相册' },
  { id: 'camera', icon: 'photo_camera', label: '拍摄' },
  { id: 'video', icon: 'videocam', label: '视频' },
  { id: 'location', icon: 'location_on', label: '位置' },
  { id: 'card', icon: 'badge', label: '个人名片' },
  { id: 'bookmark', icon: 'bookmarks', label: '收藏灵感' },
];

export const MessagesView: React.FC = () => {
  const {
    user,
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sendMessage,
    isReplying,
    bookmarks,
    showToast,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [showPlusPanel, setShowPlusPanel] = useState(false);
  const [showBookmarkPicker, setShowBookmarkPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setCompressing(true);
    setShowPlusPanel(false);
    try {
      const dataUrl = await compressImage(file);
      setPendingImage(dataUrl);
    } catch {
      showToast('图片处理失败，请换一张试试', 'error');
    } finally {
      setCompressing(false);
    }
  };

  const handlePlusAction = (id: string) => {
    switch (id) {
      case 'album':
        fileInputRef.current?.click();
        break;
      case 'camera':
        cameraInputRef.current?.click();
        break;
      case 'video':
        setShowPlusPanel(false);
        showToast('视频消息即将上线，敬请期待', 'info');
        break;
      case 'location':
        setShowPlusPanel(false);
        sendMessage('📍 分享位置 | 杭州 · 良渚文化艺术中心');
        scrollToBottom();
        break;
      case 'card':
        setShowPlusPanel(false);
        if (user) {
          sendMessage(`🪪 我的名片 | ${user.name} ${user.handle}\n${user.bio || '美学灵感收集者'}`);
          scrollToBottom();
        }
        break;
      case 'bookmark':
        setShowPlusPanel(false);
        setShowBookmarkPicker(true);
        break;
    }
  };

  const shareBookmark = (bmId: string) => {
    const bm = bookmarks.find((b) => b.id === bmId);
    setShowBookmarkPicker(false);
    if (bm) {
      sendMessage(`🔖 分享灵感 |《${bm.title}》\n${bm.excerpt ? bm.excerpt.slice(0, 50) : bm.category}`);
      scrollToBottom();
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text && !pendingImage) return;
    sendMessage(text, pendingImage || undefined);
    setInputText('');
    setPendingImage(null);
    setShowPlusPanel(false);
    scrollToBottom();
  };

  // ---------- Conversation List ----------
  if (!activeConversation) {
    return (
      <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-headline text-2xl font-bold text-[#0b1c30] dark:text-white">消息</h2>
            <p className="text-xs text-[#424754] dark:text-gray-300">与创作者们的对话</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#2170e4]/15 text-[#0058be] dark:text-[#adc6ff] text-xs font-bold">
            {conversations.length} 个会话
          </span>
        </div>

        <div className="space-y-3">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left hover:-translate-y-0.5 transition-all border border-white/60 dark:border-white/10 shadow-xs active:scale-[0.99]"
            >
              <div className="relative shrink-0">
                <img
                  src={conv.contact.avatar}
                  alt={conv.contact.name}
                  className="w-13 h-13 w-[52px] h-[52px] rounded-full object-cover border border-white dark:border-slate-800"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-headline font-bold text-sm text-[#0b1c30] dark:text-white truncate">
                    {conv.contact.name}
                  </h3>
                  <span className="text-[10px] text-[#424754]/60 dark:text-gray-500 shrink-0 ml-2">
                    {conv.updatedAt?.includes('T') ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : conv.updatedAt}
                  </span>
                </div>
                <p className="text-xs text-[#424754] dark:text-gray-400 truncate">
                  {conv.lastText || '开始一段对话吧'}
                </p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-[#424754]/40 dark:text-gray-500 shrink-0">
                chevron_right
              </span>
            </button>
          ))}

          {conversations.length === 0 && (
            <div className="glass-panel rounded-3xl p-10 text-center text-[#424754] dark:text-gray-300">
              <span className="material-symbols-outlined text-[44px] text-slate-400 mb-2 block">chat_bubble</span>
              <p className="font-headline font-bold">暂无会话</p>
              <p className="text-xs mt-1">去探索页认识新的创作者吧</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- Chat Detail ----------
  const recipient = activeConversation.contact;

  return (
    <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-2xl mx-auto flex flex-col">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-3.5 mb-4 flex items-center justify-between border border-white/60 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setActiveConversationId(null)}
            className="p-1.5 rounded-full text-[#0058be] dark:text-[#adc6ff] hover:bg-white/40 dark:hover:bg-white/10 transition-colors shrink-0"
            aria-label="Back to conversations"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="relative shrink-0">
            <img
              src={recipient.avatar}
              alt={recipient.name}
              className="w-11 h-11 rounded-full object-cover border border-white dark:border-slate-800"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>
          <div className="min-w-0">
            <h3 className="font-headline font-bold text-sm text-[#0b1c30] dark:text-white leading-tight truncate">
              {recipient.name}
            </h3>
            <p className="text-[11px] text-[#424754] dark:text-gray-300 truncate">
              {recipient.activeStatus || '在线'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#0058be] dark:text-[#adc6ff] shrink-0">
          <button className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[20px]">call</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[20px]">videocam</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div ref={threadRef} className="flex-1 glass-card rounded-3xl p-4 md:p-6 mb-3 overflow-y-auto space-y-4 min-h-[340px] max-h-[460px] flex flex-col">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${
                isUser ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs whitespace-pre-line ${
                  isUser
                    ? 'bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white rounded-br-none'
                    : 'bg-white/90 dark:bg-slate-800 text-[#0b1c30] dark:text-white rounded-bl-none border border-slate-100 dark:border-slate-700'
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="shared"
                    className="rounded-xl max-h-56 w-auto mb-2 object-cover"
                    loading="lazy"
                  />
                )}
                {msg.text}
              </div>
              <span className="text-[10px] text-[#424754] dark:text-gray-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isReplying && (
          <div className="mr-auto items-start flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 dark:bg-slate-800 text-xs text-[#0058be] animate-pulse">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span>{recipient.name} is typing...</span>
          </div>
        )}
      </div>

      {/* Pending image preview */}
      {(pendingImage || compressing) && (
        <div className="glass-panel rounded-2xl p-2.5 mb-2 flex items-center gap-3 border border-white/60 dark:border-white/10 shadow-xs">
          {compressing ? (
            <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] text-[#424754] dark:text-gray-300 animate-spin">sync</span>
            </div>
          ) : (
            <img src={pendingImage!} alt="pending" className="w-14 h-14 rounded-xl object-cover" />
          )}
          <span className="flex-1 text-xs text-[#424754] dark:text-gray-300">
            {compressing ? '图片压缩中...' : '图片已就绪，输入文字或直接发送'}
          </span>
          {!compressing && (
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Remove image"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      )}

      {/* WeChat-style plus panel */}
      <AnimatePresence>
        {showPlusPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden mb-2"
          >
            <div className="glass-panel rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-xs">
              <div className="grid grid-cols-4 gap-3">
                {PLUS_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handlePlusAction(action.id)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <span className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[#424754] dark:text-gray-200 group-hover:bg-[#2170e4]/15 group-hover:text-[#0058be] dark:group-hover:text-[#adc6ff] group-active:scale-95 transition-all">
                      <span className="material-symbols-outlined text-[24px]">{action.icon}</span>
                    </span>
                    <span className="text-[10px] text-[#424754] dark:text-gray-300">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs: album & camera */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

      {/* Input Bar */}
      <form onSubmit={handleSend} className="glass-panel rounded-2xl p-2 flex items-center gap-2 border border-white/60 dark:border-white/10 shadow-md">
        <button
          type="button"
          onClick={() => setShowPlusPanel((v) => !v)}
          className={`p-2 rounded-full transition-all ${
            showPlusPanel
              ? 'text-[#0058be] rotate-45'
              : 'text-[#424754] dark:text-gray-300 hover:text-[#0058be]'
          }`}
          title="更多"
        >
          <span className="material-symbols-outlined text-[24px]">add_circle</span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => setShowPlusPanel(false)}
          placeholder="Send a message..."
          className="flex-1 bg-transparent border-none text-sm text-[#0b1c30] dark:text-white focus:outline-none px-2"
        />

        <button
          type="button"
          className="p-2 rounded-full text-[#424754] dark:text-gray-300 hover:text-[#0058be] transition-colors"
          title="Emoji"
        >
          <span className="material-symbols-outlined text-[22px]">sentiment_satisfied</span>
        </button>

        <button
          type="submit"
          disabled={!inputText.trim() && !pendingImage}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </form>

      {/* Bookmark picker modal */}
      <AnimatePresence>
        {showBookmarkPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowBookmarkPicker(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-md rounded-3xl p-5 max-h-[70vh] overflow-y-auto no-scrollbar border border-white/60 dark:border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white">
                  分享收藏的灵感
                </h3>
                <button
                  onClick={() => setShowBookmarkPicker(false)}
                  className="p-1.5 rounded-full hover:bg-white/50 text-[#424754] dark:text-gray-200"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="space-y-2.5">
                {bookmarks.map((bm) => (
                  <button
                    key={bm.id}
                    onClick={() => shareBookmark(bm.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <img src={bm.imageUrl} alt={bm.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0b1c30] dark:text-white truncate">{bm.title}</p>
                      <p className="text-[10px] text-[#424754] dark:text-gray-400 truncate">{bm.category} · {bm.source}</p>
                    </div>
                  </button>
                ))}
                {bookmarks.length === 0 && (
                  <p className="text-xs text-center text-[#424754] dark:text-gray-400 py-6">
                    还没有收藏内容，先去探索页收藏一些灵感吧
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

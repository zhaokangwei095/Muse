import React, { useState, useRef } from 'react';
import { DirectMessage, User } from '../types';

interface MessagesViewProps {
  recipient: User;
  messages: DirectMessage[];
  onSendMessage: (text: string, image?: string) => void;
  isReplying?: boolean;
}

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

export const MessagesView: React.FC<MessagesViewProps> = ({
  recipient,
  messages,
  onSendMessage,
  isReplying,
}) => {
  const [inputText, setInputText] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const handlePickImage = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file || !file.type.startsWith('image/')) return;
    setCompressing(true);
    try {
      const dataUrl = await compressImage(file);
      setPendingImage(dataUrl);
    } catch {
      // toast handled by parent context-less views; keep silent fallback here
      console.error('Image compress failed');
    } finally {
      setCompressing(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text && !pendingImage) return;
    onSendMessage(text, pendingImage || undefined);
    setInputText('');
    setPendingImage(null);
    scrollToBottom();
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-2xl mx-auto flex flex-col">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 mb-4 flex items-center justify-between border border-white/60 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={recipient.avatar}
              alt={recipient.name}
              className="w-12 h-12 rounded-full object-cover border border-white dark:border-slate-800"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white leading-tight">
              {recipient.name}
            </h3>
            <p className="text-xs text-[#424754] dark:text-gray-300">
              {recipient.activeStatus || 'Active 2h ago'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#0058be] dark:text-[#adc6ff]">
          <button className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[20px]">call</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[20px]">videocam</span>
          </button>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div ref={threadRef} className="flex-1 glass-card rounded-3xl p-4 md:p-6 mb-4 overflow-y-auto space-y-4 min-h-[380px] max-h-[500px] flex flex-col">
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
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs ${
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

      {/* Hidden file input for local image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Input Bar */}
      <form onSubmit={handleSend} className="glass-panel rounded-2xl p-2 flex items-center gap-2 border border-white/60 dark:border-white/10 shadow-md">
        <button
          type="button"
          onClick={handlePickImage}
          className="p-2 rounded-full text-[#424754] dark:text-gray-300 hover:text-[#0058be] transition-colors"
          title="上传本地图片"
        >
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
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
    </div>
  );
};

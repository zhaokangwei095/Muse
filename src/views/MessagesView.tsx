import React, { useState } from 'react';
import { DirectMessage, User } from '../types';

interface MessagesViewProps {
  recipient: User;
  messages: DirectMessage[];
  onSendMessage: (text: string) => void;
  isReplying?: boolean;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  recipient,
  messages,
  onSendMessage,
  isReplying,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
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
      <div className="flex-1 glass-card rounded-3xl p-4 md:p-6 mb-4 overflow-y-auto space-y-4 min-h-[380px] max-h-[500px] flex flex-col">
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

      {/* Input Bar */}
      <form onSubmit={handleSend} className="glass-panel rounded-2xl p-2 flex items-center gap-2 border border-white/60 dark:border-white/10 shadow-md">
        <button
          type="button"
          className="p-2 rounded-full text-[#424754] dark:text-gray-300 hover:text-[#0058be] transition-colors"
          title="Attach Image"
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
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </form>
    </div>
  );
};

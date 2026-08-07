import React, { useState } from 'react';

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenAuth,
  onBack,
}) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('zh-CN');

  return (
    <div className="w-full min-h-screen pt-20 pb-28 md:pt-28 md:pb-16 px-4 md:px-10 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full glass-button text-[#0058be] dark:text-[#adc6ff]"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h2 className="font-headline text-2xl font-bold text-[#0b1c30] dark:text-white">
            Settings & Preferences
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance Card */}
        <div className="glass-panel rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-sm">
          <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be]">palette</span>
            <span>Appearance</span>
          </h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-semibold text-[#0b1c30] dark:text-white block">
                Dark Theme
              </span>
              <span className="text-xs text-[#424754] dark:text-gray-300">
                Easier on the eyes in low light
              </span>
            </div>

            <button
              onClick={onToggleDarkMode}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                isDarkMode ? 'bg-[#2170e4]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-sm">
          <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be]">notifications</span>
            <span>Notifications</span>
          </h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-semibold text-[#0b1c30] dark:text-white block">
                Push Notifications
              </span>
              <span className="text-xs text-[#424754] dark:text-gray-300">
                Direct messages & new curation alerts
              </span>
            </div>

            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                pushNotifications ? 'bg-[#2170e4]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                  pushNotifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="glass-panel rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-sm">
          <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be]">language</span>
            <span>Language</span>
          </h3>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
          >
            <option value="zh-CN">中文 (简体)</option>
            <option value="en-US">English (US)</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>

        {/* Account Actions */}
        <div className="glass-panel rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-sm">
          <h3 className="font-headline font-bold text-base text-[#0b1c30] dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be]">account_circle</span>
            <span>Account</span>
          </h3>

          <button
            onClick={onOpenAuth}
            className="w-full py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Switch Account / Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

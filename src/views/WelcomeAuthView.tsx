import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface WelcomeAuthViewProps {
  onSuccessAuth: () => void;
}

export const WelcomeAuthView: React.FC<WelcomeAuthViewProps> = ({ onSuccessAuth }) => {
  const { showToast } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('13800138000');
  const [countryCode, setCountryCode] = useState('+86');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [sentCode, setSentCode] = useState(false);

  const handleSendCode = () => {
    if (!phoneNumber) return;
    setSentCode(true);
    setCode('888888');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      showToast('Please agree to the User Terms and Privacy Policy.', 'error');
      return;
    }
    onSuccessAuth();
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#e8f1ff] to-[#f4e8ff] dark:from-[#0b1c30] dark:via-[#132742] dark:to-[#1e1e38] flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/80 dark:border-white/10 flex flex-col items-center text-center">
        {/* Graphic */}
        <div className="w-32 h-32 rounded-3xl overflow-hidden mb-6 shadow-xl transform hover:rotate-3 transition-transform">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzbf6P22ypH2xLxv_4XffI5ElRCyAY-3FfjlOHO21aunY4554w7ARzCQdUqsaQVWNfbcgvZEGZj-tdLrbmVTah7ANYzXgHm4l-hdHG7KogRderM_UXfbIDKu6bQIaX_V9XB3T_D_1ZbJl57vZnqyPIc8khdy8nSYknDKcdpXMOlhKb_W8_9-57wOPUxl8PkS-sDAXKuFFkM2B3CzI9OnhF_HCBXYt-2C6hc2fas9rcG-jotdcSZqcTfw"
            alt="Muse Welcome Graphic"
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="font-headline text-3xl font-bold tracking-tight text-[#0058be] dark:text-[#adc6ff] mb-2">
          Muse
        </h1>
        <p className="text-sm text-[#424754] dark:text-gray-300 mb-8 font-medium">
          Discover Beauty. Share Life.
        </p>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          {/* Phone Input with Country Code */}
          <div className="flex bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden p-1 shadow-xs focus-within:ring-2 focus-within:ring-[#0058be]">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0058be] dark:text-[#adc6ff] px-3 focus:outline-none cursor-pointer"
            >
              <option value="+86">+86 (CN)</option>
              <option value="+1">+1 (US)</option>
              <option value="+81">+81 (JP)</option>
              <option value="+44">+44 (UK)</option>
            </select>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[#0b1c30] dark:text-white focus:outline-none"
              required
            />
          </div>

          {/* Verification Code */}
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Verification Code"
              className="flex-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-[#0b1c30] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0058be]"
            />
            <button
              type="button"
              onClick={handleSendCode}
              className="px-4 py-2.5 rounded-2xl bg-[#eff4ff] dark:bg-slate-700 text-[#0058be] dark:text-[#adc6ff] text-xs font-bold hover:bg-[#e1ecff] transition-colors shrink-0"
            >
              {sentCode ? 'Resend' : 'Get Code'}
            </button>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center gap-2 text-left pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 text-[#0058be] rounded focus:ring-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-[11px] text-[#424754] dark:text-gray-300">
              I agree to the <span className="text-[#0058be] underline cursor-pointer">User Terms</span> and{' '}
              <span className="text-[#0058be] underline cursor-pointer">Privacy Policy</span>.
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all mt-4"
          >
            Enter Muse App
          </button>
        </form>
      </div>
    </div>
  );
};

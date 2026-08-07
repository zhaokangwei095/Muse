// @ts-nocheck
import React from 'react';

interface EBProps { children: React.ReactNode }
interface EBState { hasError: boolean; error: string }

export class ErrorBoundary extends React.Component<EBProps, EBState> {
  state = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen flex items-center justify-center bg-[#f8f9ff] dark:bg-[#0b1c30] p-8">
          <div className="glass-panel rounded-3xl p-10 text-center max-w-md border border-white/60 dark:border-white/10 shadow-lg">
            <span className="material-symbols-outlined text-[48px] text-red-400 mb-4 block">error</span>
            <h2 className="font-headline text-2xl font-bold text-[#0b1c30] dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#424754] dark:text-gray-300 mb-6">{this.state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#2170e4] to-[#0058be] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

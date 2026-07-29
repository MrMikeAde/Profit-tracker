import React from 'react';
import { ShieldCheck, ArrowLeft, TrendingUp } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onReset?: () => void;
  showReset?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onReset, showReset = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Premium Header */}
      <header className="bg-[#0a2540] text-white shadow-md sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onReset?.()}>
            {/* Custom Sleek Logo Emblem */}
            <div className="w-9 h-9 relative flex items-center justify-center bg-gradient-to-tr from-[#117aca] to-[#004b87] rounded-lg shadow-inner">
              <TrendingUp className="w-5 h-5 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ffb81c] rounded-full animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                What<span className="text-[#ffb81c]">I</span>Earn
              </span>
              <div className="text-[10px] text-blue-200 tracking-widest uppercase font-semibold">Profit Tracker</div>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            {showReset && onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 bg-[#117aca] hover:bg-[#004b87] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> New Report
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              WhatIEarn Profit Tracker
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              Premium privacy-first client-side financial analytics dashboard. &copy; {new Date().getFullYear()} WhatIEarn. All rights reserved.
            </p>
          </div>
          <div className="mt-6 sm:mt-0 flex flex-wrap justify-center sm:justify-end gap-6 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/30 select-none">
              <ShieldCheck className="w-4 h-4" /> 100% Client-side privacy
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

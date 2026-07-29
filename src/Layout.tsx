import React from 'react';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onReset?: () => void;
  showReset?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onReset, showReset = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Premium Chase-style Header */}
      <header className="bg-[#0a2540] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onReset?.()}>
            {/* Chase Bank Styled Octagon Emblem Logo SVG */}
            <div className="w-8 h-8 relative flex items-center justify-center bg-white rounded-md p-1">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#117aca]" fill="currentColor">
                <polygon points="50,15 85,50 50,85 15,50" />
                <polygon points="50,28 72,50 50,72 28,50" className="text-white" />
                <polygon points="50,38 62,50 50,62 38,50" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-wider text-white uppercase">
                CHASE<span className="text-[#ffb81c] font-normal lowercase ml-1">inspired</span>
              </span>
              <div className="text-[10px] text-blue-200 tracking-widest uppercase font-semibold">Profit Tracker</div>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <a
              href="https://moneypage.xyz"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition font-medium"
            >
              <FileText className="w-3.5 h-3.5" /> original moneypage.xyz
            </a>

            {showReset && onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 bg-[#117aca] hover:bg-[#004b87] text-white px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm cursor-pointer"
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
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Profit Tracker. Recreated with premium Chase Bank inspiration.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Inspired by the simplicity of MoneyPage. All rights reserved to their respective creators.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex justify-center sm:justify-end gap-6 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> 100% Client-side privacy
            </span>
            <a
              href="https://moneypage.xyz"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

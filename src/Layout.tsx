import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, TrendingUp } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-light-gray text-soft-black font-sans">
      {/* Premium Header - Styled in Dark Green with Crisp White text */}
      <header className="bg-dark-green text-crisp-white shadow-md sticky top-0 z-50 border-b border-dark-green-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => navigate('/')}
          >
            {/* Custom Sleek Logo Emblem in Deep Indigo with Mint dot */}
            <div className="w-9 h-9 relative flex items-center justify-center bg-deep-indigo rounded-lg shadow-inner">
              <TrendingUp className="w-5 h-5 text-bright-mint" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-bright-mint rounded-full animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-crisp-white">
                What<span className="text-bright-mint">I</span>Earn
              </span>
              <div className="text-[10px] text-light-gray tracking-widest uppercase font-semibold">Profit Tracker</div>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            {!isHome && (
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center gap-1.5 bg-deep-indigo hover:bg-deep-indigo-hover text-crisp-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> New Statement
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Restyled in deep dark green or deep indigo */}
      <footer className="bg-deep-indigo text-light-gray border-t border-deep-indigo-hover py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-crisp-white">
              WhatIEarn Profit Tracker
            </p>
            <p className="text-xs text-gray-400 mt-1.5">
              Premium privacy-first client-side financial analytics dashboard. &copy; {new Date().getFullYear()} WhatIEarn. All rights reserved.
            </p>
          </div>
          <div className="mt-6 sm:mt-0 flex flex-wrap justify-center sm:justify-end gap-6 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-bright-mint bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/30 select-none">
              <ShieldCheck className="w-4 h-4" /> 100% Client-side privacy
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

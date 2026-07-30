import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 space-y-24">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-dark-green leading-tight">
          Years of Financial Statements.<br />
          <span className="text-bright-mint">One Gorgeous Profit Tracker.</span>
        </h1>
        <p className="text-lg md:text-xl text-soft-black/80 max-w-2xl mx-auto leading-relaxed">
          Convert raw bank PDF, CSV, or Excel statements into a beautiful, secure, and interactive client-side profit-and-loss dashboard instantly.
        </p>

        <div className="pt-4">
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-dark-green to-dark-green-hover hover:from-dark-green-hover hover:to-dark-green text-crisp-white text-base md:text-lg font-bold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none"
          >
            Get Started <ArrowRight className="w-5 h-5 text-bright-mint" />
          </button>
        </div>
      </div>

      {/* Styled 3-Step Process Steps */}
      <div className="border-t border-gray-200 pt-16">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-dark-green uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            How It Works
          </span>
          <h2 className="text-3xl font-black text-dark-green mt-3">Simple. Secure. Instant.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between">
            <div>
              {/* Extremely Prominent & Visible Large Numeric Indicator in Dark Green */}
              <div className="text-4xl font-extrabold text-dark-green tracking-tight mb-5 select-none">
                01
              </div>
              <h3 className="text-xl font-bold text-dark-green mb-3">Upload your bank statements</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Securely drop your raw bank PDF, CSV, or Excel exports. Our client-side analyzer processes files entirely in-memory, keeping your data 100% confidential.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between">
            <div>
              {/* Extremely Prominent & Visible Large Numeric Indicator in Dark Green */}
              <div className="text-4xl font-extrabold text-dark-green tracking-tight mb-5 select-none">
                02
              </div>
              <h3 className="text-xl font-bold text-dark-green mb-3">We normalize and verify totals</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                The engine automatically maps layout columns, reconciles multi-currency attributes, and cross-checks mathematical totals to align transactions perfectly.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between">
            <div>
              {/* Extremely Prominent & Visible Large Numeric Indicator in Dark Green */}
              <div className="text-4xl font-extrabold text-dark-green tracking-tight mb-5 select-none">
                03
              </div>
              <h3 className="text-xl font-bold text-dark-green mb-3">Open your private money page</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Explore your beautiful custom capital progression chart, daily spending rhythm heatmap, savings rate gauges, and recurring subscription predictions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

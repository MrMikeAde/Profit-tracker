import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 space-y-24">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#0a2540] leading-tight">
          Years of Financial Statements.<br />
          <span className="text-[#117aca]">One Gorgeous Profit Tracker.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Convert raw bank PDF, CSV, or Excel statements into a beautiful, secure, and interactive client-side profit-and-loss dashboard instantly.
        </p>

        <div className="pt-4">
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#117aca] to-[#004b87] hover:from-[#004b87] hover:to-[#117aca] text-white text-base md:text-lg font-bold px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Styled 3-Step Process Steps */}
      <div className="border-t border-gray-100 pt-16">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#117aca] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            How It Works
          </span>
          <h2 className="text-3xl font-black text-[#0a2540] mt-3">Simple. Secure. Instant.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between">
            <div>
              {/* Extremely Prominent & Visible Large Numeric Indicator */}
              <div className="text-4xl font-extrabold text-[#117aca] tracking-tight mb-5 select-none">
                01
              </div>
              <h3 className="text-xl font-bold text-[#0a2540] mb-3">Upload your bank statements</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Securely drop your raw bank PDF, CSV, or Excel exports. Our client-side analyzer processes files entirely in-memory, keeping your data 100% confidential.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between">
            <div>
              {/* Extremely Prominent & Visible Large Numeric Indicator */}
              <div className="text-4xl font-extrabold text-[#117aca] tracking-tight mb-5 select-none">
                02
              </div>
              <h3 className="text-xl font-bold text-[#0a2540] mb-3">We normalize and verify totals</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                The engine automatically maps layout columns, reconciles multi-currency attributes, and cross-checks mathematical totals to align transactions perfectly.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition relative group flex flex-col justify-between">
            <div>
              {/* Extremely Prominent & Visible Large Numeric Indicator */}
              <div className="text-4xl font-extrabold text-[#117aca] tracking-tight mb-5 select-none">
                03
              </div>
              <h3 className="text-xl font-bold text-[#0a2540] mb-3">Open your private money page</h3>
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

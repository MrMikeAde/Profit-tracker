import React from 'react';
import { Upload, FileSpreadsheet, Lock, Sparkles, TrendingUp, HelpCircle, Shield, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onLoadPreset: (preset: 'naira' | 'usd' | 'eur') => void;
  onFileUpload: (file: File) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoadPreset, onFileUpload }) => {
  const [dragOver, setDragOver] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setErrorMsg(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['.csv', '.xlsx', '.xls', '.pdf'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (validTypes.includes(fileExtension)) {
        onFileUpload(file);
      } else {
        setErrorMsg('Invalid file format. Please drop a valid CSV, Excel, or PDF bank statement.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-[#ffb81c]/10 text-[#004b87] border border-[#ffb81c]/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#ffb81c]" /> Zero-Database &middot; Enterprise-Grade Security
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#0a2540] leading-tight max-w-4xl mx-auto">
          Years of Financial Statements.<br />
          <span className="text-[#117aca]">One Gorgeous Profit Tracker.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Add PDF, CSV, or Excel bank statements from any of your financial institutions and instantly convert them into a beautiful, interactive private profit tracker page.
        </p>
      </div>

      {/* Main Upload / Preset Area */}
      <div className="grid md:grid-cols-12 gap-8 items-stretch mb-16">
        {/* Dropzone Box */}
        <div className="md:col-span-7 bg-white border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col justify-between transition hover:shadow-xl">
          <div>
            <h3 className="text-xl font-bold text-[#0a2540] mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#117aca]" /> Upload Your Statements
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Drag & drop your CSV, XLSX, XLS, or PDF statement file below. All analysis is completed directly in your browser. Your financial data is secure, private, and never uploaded to any external server.
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                dragOver
                  ? 'border-[#117aca] bg-[#117aca]/5'
                  : 'border-gray-300 hover:border-[#117aca] hover:bg-gray-50'
              }`}
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <input
                id="file-upload-input"
                type="file"
                className="hidden"
                accept=".csv, .xlsx, .xls, .pdf"
                onChange={handleFileChange}
              />
              <FileSpreadsheet className="w-16 h-16 text-[#004b87] mb-4" />
              <p className="text-base font-semibold text-gray-700">
                Drop your statement here or <span className="text-[#117aca] underline hover:text-[#004b87]">browse files</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">Supports standard export files (PDF, CSV, XLSX, XLS)</p>
            </div>

            {errorMsg && (
              <p className="mt-4 text-sm text-red-600 font-medium bg-red-50 p-2.5 rounded border border-red-200">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
            <Lock className="w-4 h-4 text-[#117aca]" />
            <span>Private by default. 100% Client-Side Processing. No registration required.</span>
          </div>
        </div>

        {/* Demo Preset Card */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#0a2540] to-[#004b87] text-white rounded-xl shadow-lg p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ffb81c]" /> Try It Out Instantly
            </h3>
            <p className="text-sm text-blue-100 mb-6">
              Don't have a statement handy? Load one of our curated high-fidelity sample presets to experience the interactive dashboard immediately.
            </p>

            <div className="space-y-3.5">
              <button
                onClick={() => onLoadPreset('naira')}
                className="w-full text-left bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 hover:border-white/40 p-4 rounded-xl transition flex items-center justify-between pointer-events-auto cursor-pointer animate-none"
              >
                <div>
                  <div className="font-bold text-sm text-white">Naira-based Demo Report</div>
                  <div className="text-xs text-blue-200">₦33.5M Inflow · 6 years of activity</div>
                </div>
                <span className="text-xs font-semibold bg-[#ffb81c] text-[#0a2540] px-2.5 py-1 rounded">NGN</span>
              </button>

              <button
                onClick={() => onLoadPreset('usd')}
                className="w-full text-left bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 hover:border-white/40 p-4 rounded-xl transition flex items-center justify-between pointer-events-auto cursor-pointer"
              >
                <div>
                  <div className="font-bold text-sm text-white">US Corporate Treasury</div>
                  <div className="text-xs text-blue-200">$363K Inflow · 1 year SaaS Model</div>
                </div>
                <span className="text-xs font-semibold bg-emerald-500 text-white px-2.5 py-1 rounded">USD</span>
              </button>

              <button
                onClick={() => onLoadPreset('eur')}
                className="w-full text-left bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 hover:border-white/40 p-4 rounded-xl transition flex items-center justify-between pointer-events-auto cursor-pointer"
              >
                <div>
                  <div className="font-bold text-sm text-white">European Venture Capital</div>
                  <div className="text-xs text-blue-200">€105K Inflow · Venture Dividends</div>
                </div>
                <span className="text-xs font-semibold bg-indigo-500 text-white px-2.5 py-1 rounded">EUR</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-blue-200 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-[#ffb81c] shrink-0 mt-0.5" />
            <span className="leading-normal font-medium">
              Note: Clicking a preset will showcase a simulated demo dataset. To see your own transaction insights, drop your personal file.
            </span>
          </div>
        </div>
      </div>

      {/* Feature Section with Icons */}
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-[#117aca]/10 rounded-lg flex items-center justify-center text-[#117aca] mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#0a2540] mb-2">Maximum Privacy</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your bank statement files never leave your computer. Parsing and charting are done securely within your browser sandbox environment.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-[#004b87]/10 rounded-lg flex items-center justify-center text-[#004b87] mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#0a2540] mb-2">Beautiful Analytics</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Gain clarity with interactive tools: Balance over time, Monthly cash flow, Category distribution lists, and top payees/payers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-[#ffb81c]/10 rounded-lg flex items-center justify-center text-amber-600 mb-4">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-[#0a2540] mb-2">Universal Parser</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            No rigid formats required. If our automatic analyzer needs guidance, a manual column selector appears to let you map custom formats easily.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Upload, FileSpreadsheet, Lock, Sparkles, TrendingUp, HelpCircle, Shield } from 'lucide-react';

interface LandingPageProps {
  onFileUpload: (file: File) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onFileUpload }) => {
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
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
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
          Convert raw bank PDF, CSV, or Excel statements into a beautiful, secure, and interactive client-side profit-and-loss dashboard.
        </p>
      </div>

      {/* Main Upload Area */}
      <div className="max-w-3xl mx-auto mb-20">
        {/* Dropzone Box */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 md:p-10 flex flex-col justify-between transition hover:shadow-2xl">
          <div>
            <h3 className="text-2xl font-black text-[#0a2540] mb-3 flex items-center justify-center gap-2 text-center">
              <Upload className="w-6 h-6 text-[#117aca]" /> Upload Your Statement
            </h3>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-lg mx-auto">
              Drag & drop your bank statement file below. All analysis is completed instantly directly inside your browser thread. Your sensitive data never leaves your computer.
            </p>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 md:p-16 text-center transition flex flex-col items-center justify-center cursor-pointer ${
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
              <FileSpreadsheet className="w-20 h-20 text-[#004b87] mb-5 animate-pulse" />
              <p className="text-lg font-bold text-gray-700">
                Drop your statement here or <span className="text-[#117aca] underline hover:text-[#004b87]">browse files</span>
              </p>
              <p className="text-xs text-gray-400 mt-2.5">Supports PDF, CSV, XLSX, and XLS exports</p>
            </div>

            {errorMsg && (
              <p className="mt-5 text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500 text-center">
            <Lock className="w-4 h-4 text-[#117aca]" />
            <span>100% Client-Side Sandboxed Processing. Safe & Certified. No signup required.</span>
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

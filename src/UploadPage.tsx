import React from 'react';
import { Upload, FileSpreadsheet, Lock, ArrowLeft } from 'lucide-react';

interface UploadPageProps {
  onFileUpload: (file: File) => void;
  onBack: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onFileUpload, onBack }) => {
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
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-8">
      {/* Return to home button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0a2540] transition cursor-pointer select-none"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>
      </div>

      {/* Upload Box Container */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8 md:p-12 flex flex-col justify-between transition hover:shadow-2xl">
        <div>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black text-[#0a2540] mb-2 flex items-center justify-center gap-2">
              <Upload className="w-7 h-7 text-[#117aca]" /> Upload Your Statement
            </h3>
            <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
              Drag & drop your bank statement file below. All analysis is completed instantly directly inside your browser thread. Your sensitive data never leaves your computer.
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 md:p-20 text-center transition flex flex-col items-center justify-center cursor-pointer ${
              dragOver
                ? 'border-[#117aca] bg-[#117aca]/5'
                : 'border-gray-300 hover:border-[#117aca] hover:bg-gray-50'
            }`}
            onClick={() => document.getElementById('file-upload-input2')?.click()}
          >
            <input
              id="file-upload-input2"
              type="file"
              className="hidden"
              accept=".csv, .xlsx, .xls, .pdf"
              onChange={handleFileChange}
            />
            <FileSpreadsheet className="w-24 h-24 text-[#004b87] mb-6 animate-bounce" />
            <p className="text-xl font-bold text-gray-700">
              Drop your bank statement here or <span className="text-[#117aca] underline hover:text-[#004b87]">browse files</span>
            </p>
            <p className="text-xs text-gray-400 mt-3">Supports PDF, CSV, XLSX, and XLS formats</p>
          </div>

          {errorMsg && (
            <p className="mt-6 text-sm text-red-600 font-medium bg-red-50 p-3.5 rounded-lg border border-red-200 text-center">
              {errorMsg}
            </p>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500 text-center">
          <Lock className="w-4 h-4 text-[#117aca]" />
          <span>100% Client-Side Sandboxed Processing. Safe & Certified. No signup required.</span>
        </div>
      </div>
    </div>
  );
};

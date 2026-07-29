import React, { useState, useEffect } from 'react';
import { Columns, ArrowRight, Check } from 'lucide-react';
import { createReportFromRows } from './parser';
import type { ReportData } from './demoData';

interface ColumnMapperProps {
  fileName: string;
  rawRows: any[][];
  onMappingComplete: (report: ReportData) => void;
  onCancel: () => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  fileName,
  rawRows,
  onMappingComplete,
  onCancel
}) => {
  const [headerRow, setHeaderRow] = useState<any[]>([]);
  const [sampleRows, setSampleRows] = useState<any[][]>([]);

  // Mapping state indices
  const [dateIdx, setDateIdx] = useState<number>(-1);
  const [descIdx, setDescIdx] = useState<number>(-1);
  const [amtIdx, setAmtIdx] = useState<number>(-1);
  const [categoryIdx, setCategoryIdx] = useState<number | null>(null);

  // Currency Selection
  const [currencySymbol, setCurrencySymbol] = useState<string>('₦');
  const [currencyCode, setCurrencyCode] = useState<string>('NGN');

  useEffect(() => {
    if (rawRows && rawRows.length > 0) {
      // Find the first row that looks like a header, or default to row 0
      const potentialHeader = rawRows[0] || [];
      setHeaderRow(potentialHeader);

      // Auto-detect columns based on potential names
      let detectedDate = -1;
      let detectedDesc = -1;
      let detectedAmt = -1;
      let detectedCat = -1;

      potentialHeader.forEach((col: any, idx: number) => {
        const val = String(col).toLowerCase();
        if (val.includes('date') || val.includes('time') || val.includes('period')) {
          if (detectedDate === -1) detectedDate = idx;
        }
        if (val.includes('desc') || val.includes('narrat') || val.includes('particular') || val.includes('payee') || val.includes('remark')) {
          if (detectedDesc === -1) detectedDesc = idx;
        }
        if (val.includes('amount') || val.includes('value') || val.includes('sum') || val.includes('price') || val.includes('amt')) {
          if (detectedAmt === -1) detectedAmt = idx;
        }
        if (val.includes('category') || val.includes('tag') || val.includes('group') || val.includes('class')) {
          if (detectedCat === -1) detectedCat = idx;
        }
      });

      // Fallbacks if not auto-detected
      setDateIdx(detectedDate !== -1 ? detectedDate : 0);
      setDescIdx(detectedDesc !== -1 ? detectedDesc : Math.min(1, potentialHeader.length - 1));
      setAmtIdx(detectedAmt !== -1 ? detectedAmt : Math.min(2, potentialHeader.length - 1));
      setCategoryIdx(detectedCat !== -1 ? detectedCat : null);

      // Get up to 5 sample data rows
      setSampleRows(rawRows.slice(1, 6));
    }
  }, [rawRows]);

  const handleFinish = () => {
    if (dateIdx === -1 || descIdx === -1 || amtIdx === -1) {
      alert('Please select the columns for Date, Description, and Amount to proceed.');
      return;
    }
    const report = createReportFromRows(
      fileName,
      rawRows,
      { dateIdx, descIdx, amtIdx, categoryIdx },
      currencySymbol,
      currencyCode
    );
    onMappingComplete(report);
  };

  const selectCurrency = (symbol: string, code: string) => {
    setCurrencySymbol(symbol);
    setCurrencyCode(code);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#0a2540] text-white p-6">
          <div className="flex items-center gap-3">
            <Columns className="w-6 h-6 text-[#ffb81c]" />
            <div>
              <h2 className="text-xl font-bold">Align Your Statement Columns</h2>
              <p className="text-xs text-blue-200 mt-1">File Loaded: {fileName}</p>
            </div>
          </div>
        </div>

        {/* Configuration body */}
        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2540] mb-3">1. Select Base Currency</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { symbol: '₦', code: 'NGN', label: 'Naira (₦)' },
                { symbol: '$', code: 'USD', label: 'US Dollar ($)' },
                { symbol: '€', code: 'EUR', label: 'Euro (€)' },
                { symbol: '£', code: 'GBP', label: 'Pound (£)' },
                { symbol: '₵', code: 'GHS', label: 'Cedi (₵)' },
                { symbol: 'KSh', code: 'KES', label: 'Shilling (KSh)' }
              ].map((curr) => {
                const isSelected = currencyCode === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => selectCurrency(curr.symbol, curr.code)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#117aca] text-white border-[#117aca] shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#117aca]'
                    }`}
                  >
                    {curr.label}
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2540] mb-3">2. Column Mapping Configuration</h3>
            <p className="text-xs text-gray-500 mb-6">
              Our analyzer has attempted to automatically match the columns in your statement. Please review or adjust them below if needed.
            </p>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Date Column Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Date Column *</label>
                <select
                  value={dateIdx}
                  onChange={(e) => setDateIdx(parseInt(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#117aca] focus:border-transparent outline-none"
                >
                  <option value={-1}>-- Select --</option>
                  {headerRow.map((col, idx) => (
                    <option key={idx} value={idx}>
                      Col {idx + 1}: {String(col || `[Empty ${idx + 1}]`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Column Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Description *</label>
                <select
                  value={descIdx}
                  onChange={(e) => setDescIdx(parseInt(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#117aca] focus:border-transparent outline-none"
                >
                  <option value={-1}>-- Select --</option>
                  {headerRow.map((col, idx) => (
                    <option key={idx} value={idx}>
                      Col {idx + 1}: {String(col || `[Empty ${idx + 1}]`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Column Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Amount Column *</label>
                <select
                  value={amtIdx}
                  onChange={(e) => setAmtIdx(parseInt(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#117aca] focus:border-transparent outline-none"
                >
                  <option value={-1}>-- Select --</option>
                  {headerRow.map((col, idx) => (
                    <option key={idx} value={idx}>
                      Col {idx + 1}: {String(col || `[Empty ${idx + 1}]`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Category (Optional)</label>
                <select
                  value={categoryIdx === null ? -1 : categoryIdx}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCategoryIdx(val === -1 ? null : val);
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[#117aca] focus:border-transparent outline-none"
                >
                  <option value={-1}>Auto-Categorize (Smart Pattern Match)</option>
                  {headerRow.map((col, idx) => (
                    <option key={idx} value={idx}>
                      Col {idx + 1}: {String(col || `[Empty ${idx + 1}]`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sample Data Preview Table */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2540] mb-3">3. Sample Rows Preview</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    {headerRow.map((col, idx) => {
                      let tag = '';
                      if (idx === dateIdx) tag = ' (Date)';
                      else if (idx === descIdx) tag = ' (Desc)';
                      else if (idx === amtIdx) tag = ' (Amount)';
                      else if (idx === categoryIdx) tag = ' (Category)';

                      return (
                        <th key={idx} className={`p-3 font-bold ${tag ? 'text-[#117aca] bg-blue-50' : ''}`}>
                          Col {idx + 1}: {String(col || '')}{tag}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-gray-600">
                  {sampleRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50">
                      {headerRow.map((_, cIdx) => (
                        <td key={cIdx} className="p-3 whitespace-nowrap truncate max-w-[150px]">
                          {row[cIdx] !== undefined ? String(row[cIdx]) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="text-sm font-semibold text-gray-600 hover:text-[#0a2540] transition cursor-pointer"
          >
            Cancel and Return
          </button>
          <button
            onClick={handleFinish}
            className="inline-flex items-center gap-2 bg-[#004b87] hover:bg-[#117aca] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition hover:shadow-md cursor-pointer"
          >
            Generate Profit Tracker Report <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

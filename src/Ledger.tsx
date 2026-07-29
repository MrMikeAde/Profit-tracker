import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import type { ReportData } from './demoData';

interface LedgerProps {
  report: ReportData;
}

export const Ledger: React.FC<LedgerProps> = ({ report }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Sorting state
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Formatting helper
  const formatValue = (val: number) => {
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    const symbol = report.currencySymbol || '₦';
    return `${sign}${symbol}${absVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Extract unique categories
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    report.transactions.forEach(tx => {
      if (tx.category) cats.add(tx.category);
    });
    return Array.from(cats).sort();
  }, [report]);

  // Filter and Sort transactions
  const processedTransactions = useMemo(() => {
    let list = [...report.transactions];

    // 1. Search Query filter
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        tx =>
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      );
    }

    // 2. Type filter (inflow vs outflow)
    if (typeFilter !== 'all') {
      list = list.filter(tx => tx.type === typeFilter);
    }

    // 3. Category Filter
    if (categoryFilter !== 'all') {
      list = list.filter(tx => tx.category === categoryFilter);
    }

    // 4. Sort
    list.sort((a, b) => {
      if (sortField === 'date') {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortAsc ? timeA - timeB : timeB - timeA;
      } else {
        return sortAsc ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return list;
  }, [report, searchTerm, typeFilter, categoryFilter, sortField, sortAsc]);

  // Paginated chunk
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedTransactions, currentPage]);

  const totalPages = Math.max(1, Math.ceil(processedTransactions.length / itemsPerPage));

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 print:hidden">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header toolbar */}
        <div className="p-6 border-b border-gray-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">Complete Transaction Ledger</h3>
              <p className="text-xs text-gray-500">Fully searchable, sortable list of parsed transaction records</p>
            </div>

            {/* Filter counters */}
            <div className="text-xs font-semibold text-[#117aca] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 self-start md:self-auto">
              Showing {processedTransactions.length} of {report.transactions.length} items
            </div>
          </div>

          {/* Search and Filters grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search description, tags..."
                className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#117aca] focus:border-transparent"
              />
            </div>

            {/* Inflow/Outflow selection */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </span>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#117aca] focus:border-transparent"
              >
                <option value="all">All Transactions</option>
                <option value="inflow">Inflows (Credits)</option>
                <option value="outflow">Outflows (Debits)</option>
              </select>
            </div>

            {/* Category selection */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Layers className="h-4 w-4 text-gray-400" />
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#117aca] focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setCategoryFilter('all');
                setCurrentPage(1);
              }}
              className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-150 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th
                  onClick={() => toggleSort('date')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Transaction Date <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category / Label</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="px-6 py-4 text-right cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Amount <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-sm text-gray-400">
                    No transactions matching selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500">
                      {new Date(tx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${tx.type === 'inflow' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm truncate block" title={tx.description}>
                          {tx.description}
                        </span>
                      </div>
                    </td>

                    {/* Category Label */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        tx.type === 'inflow'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {tx.category}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right whitespace-nowrap font-black text-xs sm:text-sm">
                      <span className={tx.type === 'inflow' ? 'text-emerald-600' : 'text-red-600'}>
                        {tx.type === 'inflow' ? '+' : ''}{formatValue(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, CalendarDays, BarChart3, Globe, Download } from 'lucide-react';
import type { ReportData } from './demoData';

interface DashboardProps {
  report: ReportData;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ report, onReset }) => {
  // Format numbers to short compact form or fully readable currency
  const formatValue = (val: number, compact = false) => {
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    const symbol = report.currencySymbol || '₦';

    if (compact) {
      if (absVal >= 1000000) {
        return `${sign}${symbol}${(absVal / 1000000).toFixed(1)}M`;
      }
      if (absVal >= 1000) {
        return `${sign}${symbol}${(absVal / 1000).toFixed(1)}K`;
      }
    }
    return `${sign}${symbol}${absVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // 1. Calculations: Metric Cards
  const metrics = useMemo(() => {
    let totalInflow = 0;
    let numInflow = 0;
    let totalOutflow = 0;
    let numOutflow = 0;

    report.transactions.forEach((tx) => {
      if (tx.amount >= 0) {
        totalInflow += tx.amount;
        numInflow++;
      } else {
        totalOutflow += Math.abs(tx.amount);
        numOutflow++;
      }
    });

    const netFlow = totalInflow - totalOutflow;
    const yearsDifference = Math.max(1, new Date(report.endDate).getFullYear() - new Date(report.startDate).getFullYear() + 1);

    return {
      totalInflow,
      numInflow,
      totalOutflow,
      numOutflow,
      netFlow,
      yearsDifference,
      avgInflow: numInflow > 0 ? totalInflow / numInflow : 0,
      avgOutflow: numOutflow > 0 ? totalOutflow / numOutflow : 0,
      totalTransactions: report.transactions.length
    };
  }, [report]);

  // Year filter selection
  const yearsList = useMemo(() => {
    const years = new Set<number>();
    report.transactions.forEach((tx) => {
      const year = new Date(tx.date).getFullYear();
      if (!isNaN(year)) years.add(year);
    });
    return Array.from(years).sort();
  }, [report]);

  const [selectedYearHeatmap, setSelectedYearHeatmap] = useState<number>(yearsList[yearsList.length - 1] || new Date().getFullYear());
  const [selectedYearCharts, setSelectedYearCharts] = useState<number | 'All'>('All');

  const filteredTransactionsForCharts = useMemo(() => {
    if (selectedYearCharts === 'All') {
      return report.transactions;
    }
    return report.transactions.filter(tx => new Date(tx.date).getFullYear() === selectedYearCharts);
  }, [report, selectedYearCharts]);

  // 2. Spending Rhythm Heatmap Grid (Github Style)
  const heatmapData = useMemo(() => {
    // Generate dates map for selectedYearHeatmap
    const daysMap: { [key: string]: number } = {};
    report.transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (d.getFullYear() === selectedYearHeatmap) {
        const key = tx.date; // YYYY-MM-DD
        daysMap[key] = (daysMap[key] || 0) + 1;
      }
    });

    // Generate days of the year calendar grid
    const startDate = new Date(selectedYearHeatmap, 0, 1);
    const endDate = new Date(selectedYearHeatmap, 11, 31);
    const dates: { date: string; count: number; dayOfWeek: number; month: number }[] = [];

    const temp = new Date(startDate);
    while (temp <= endDate) {
      const yyyy = temp.getFullYear();
      const mm = String(temp.getMonth() + 1).padStart(2, '0');
      const dd = String(temp.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      dates.push({
        date: dateStr,
        count: daysMap[dateStr] || 0,
        dayOfWeek: temp.getDay(), // 0 = Sunday, 6 = Saturday
        month: temp.getMonth()
      });
      temp.setDate(temp.getDate() + 1);
    }
    return dates;
  }, [report, selectedYearHeatmap]);

  const monthsAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Heatmap helper to get color shade class based on transaction frequency
  const getShadeClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 hover:bg-gray-200';
    if (count <= 1) return 'bg-blue-100 hover:bg-blue-200';
    if (count <= 2) return 'bg-blue-300 hover:bg-blue-400';
    if (count <= 4) return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-[#004b87] hover:bg-[#0a2540]';
  };

  // 3. Balance Over Time (Area Chart Data)
  const areaChartData = useMemo(() => {
    let runningBalance = 0;
    const sorted = [...report.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group or downsample by month/date to keep charts fast & beautifully readable
    const dataPoints: { name: string; balance: number }[] = [];

    sorted.forEach((tx) => {
      runningBalance += tx.amount;
      const formattedDate = new Date(tx.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

      // Update last or push new
      if (dataPoints.length > 0 && dataPoints[dataPoints.length - 1].name === formattedDate) {
        dataPoints[dataPoints.length - 1].balance = runningBalance;
      } else {
        dataPoints.push({ name: formattedDate, balance: runningBalance });
      }
    });

    return dataPoints;
  }, [report]);

  // 4. Monthly Flow Inflow vs Outflow (Bar Chart)
  const barChartData = useMemo(() => {
    const monthlyMap: { [key: string]: { inflow: number; outflow: number } } = {};

    filteredTransactionsForCharts.forEach((tx) => {
      const d = new Date(tx.date);
      const key = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      if (!monthlyMap[key]) {
        monthlyMap[key] = { inflow: 0, outflow: 0 };
      }
      if (tx.amount >= 0) {
        monthlyMap[key].inflow += tx.amount;
      } else {
        monthlyMap[key].outflow += Math.abs(tx.amount);
      }
    });

    return Object.keys(monthlyMap).map((month) => ({
      name: month,
      Inflow: monthlyMap[month].inflow,
      Outflow: monthlyMap[month].outflow
    }));
  }, [filteredTransactionsForCharts]);

  // 5. Categorized Breakdown Analysis
  const categorizedExpenses = useMemo(() => {
    const map: { [key: string]: number } = {};
    let total = 0;
    report.transactions.forEach((tx) => {
      if (tx.amount < 0) {
        const absAmt = Math.abs(tx.amount);
        map[tx.category] = (map[tx.category] || 0) + absAmt;
        total += absAmt;
      }
    });
    return Object.keys(map).map(cat => ({
      category: cat,
      amount: map[cat],
      percent: total > 0 ? (map[cat] / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [report]);

  const categorizedIncomes = useMemo(() => {
    const map: { [key: string]: number } = {};
    let total = 0;
    report.transactions.forEach((tx) => {
      if (tx.amount >= 0) {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
        total += tx.amount;
      }
    });
    return Object.keys(map).map(cat => ({
      category: cat,
      amount: map[cat],
      percent: total > 0 ? (map[cat] / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [report]);

  // 6. Payee and Payer Analysis
  const topPayees = useMemo(() => {
    const map: { [key: string]: { amount: number; count: number } } = {};
    report.transactions.forEach((tx) => {
      if (tx.amount < 0) {
        const name = tx.description;
        if (!map[name]) map[name] = { amount: 0, count: 0 };
        map[name].amount += Math.abs(tx.amount);
        map[name].count++;
      }
    });
    return Object.keys(map).map(name => ({
      name,
      amount: map[name].amount,
      count: map[name].count
    })).sort((a, b) => b.amount - a.amount).slice(0, 10);
  }, [report]);

  const topPayers = useMemo(() => {
    const map: { [key: string]: { amount: number; count: number } } = {};
    report.transactions.forEach((tx) => {
      if (tx.amount >= 0) {
        const name = tx.description;
        if (!map[name]) map[name] = { amount: 0, count: 0 };
        map[name].amount += tx.amount;
        map[name].count++;
      }
    });
    return Object.keys(map).map(name => ({
      name,
      amount: map[name].amount,
      count: map[name].count
    })).sort((a, b) => b.amount - a.amount).slice(0, 10);
  }, [report]);

  // Extra KPI details
  const largestCredit = useMemo(() => {
    let maxVal = 0;
    report.transactions.forEach((tx) => {
      if (tx.amount > maxVal) maxVal = tx.amount;
    });
    return maxVal;
  }, [report]);

  const largestDebit = useMemo(() => {
    let maxVal = 0;
    report.transactions.forEach((tx) => {
      if (tx.amount < 0 && Math.abs(tx.amount) > maxVal) {
        maxVal = Math.abs(tx.amount);
      }
    });
    return maxVal;
  }, [report]);

  const averageMonthlyDebit = useMemo(() => {
    const monthlyMap: { [key: string]: number } = {};
    report.transactions.forEach((tx) => {
      if (tx.amount < 0) {
        const key = tx.date.substring(0, 7); // YYYY-MM
        monthlyMap[key] = (monthlyMap[key] || 0) + Math.abs(tx.amount);
      }
    });
    const months = Object.keys(monthlyMap);
    if (months.length === 0) return 0;
    const totalDebits = months.reduce((sum, m) => sum + monthlyMap[m], 0);
    return totalDebits / months.length;
  }, [report]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      {/* Header section with print trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#117aca] uppercase tracking-wider">
            <Globe className="w-4 h-4" /> Client-Side Certified Safe Report
          </div>
          <h2 className="text-2xl font-black text-[#0a2540] mt-1">{report.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Period: {new Date(report.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(report.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · {metrics.totalTransactions} transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition hover:shadow cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download PDF/Print
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            Upload New File
          </button>
        </div>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-black text-[#0a2540]">{report.title}</h1>
        <p className="text-sm text-gray-500">
          Statement Period: {report.startDate} to {report.endDate} · Generated with Chase Inspired Profit Tracker
        </p>
      </div>

      {/* Top Level Numeric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between transition hover:shadow-md">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Inflow</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatValue(metrics.totalInflow)}</h3>
            <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded font-semibold inline-block mt-2">
              {metrics.numInflow} credits
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between transition hover:shadow-md">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Outflow</span>
            <h3 className="text-2xl font-black text-red-600 mt-1">{formatValue(metrics.totalOutflow)}</h3>
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded font-semibold inline-block mt-2">
              {metrics.numOutflow} debits
            </span>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between transition hover:shadow-md">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Flow</span>
            <h3 className={`text-2xl font-black mt-1 ${metrics.netFlow >= 0 ? 'text-[#117aca]' : 'text-red-700'}`}>
              {formatValue(metrics.netFlow)}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold inline-block mt-2 ${metrics.netFlow >= 0 ? 'text-[#117aca] bg-blue-50' : 'text-red-700 bg-red-50'}`}>
              {metrics.netFlow >= 0 ? 'Positive Net Flow' : 'Deficit'}
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#117aca]">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between transition hover:shadow-md">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Closing Balance</span>
            <h3 className="text-2xl font-black text-[#0a2540] mt-1">
              {formatValue(metrics.netFlow)}
            </h3>
            <span className="text-xs text-[#0a2540] bg-[#ffb81c]/10 px-2 py-0.5 rounded font-semibold inline-block mt-2">
              {metrics.yearsDifference} years in view
            </span>
          </div>
          <div className="w-12 h-12 bg-[#ffb81c]/10 rounded-lg flex items-center justify-center text-amber-600">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Spending Rhythm Heatmap */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#004b87]" />
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">Spending Rhythm Heatmap</h3>
              <p className="text-xs text-gray-500">Visualization of transaction frequency across daily grid</p>
            </div>
          </div>

          {/* Year filtering buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {yearsList.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYearHeatmap(y)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedYearHeatmap === y
                    ? 'bg-[#117aca] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Map Rendering */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px] flex gap-2">
            {/* Days list label */}
            <div className="flex flex-col justify-around text-[10px] text-gray-400 font-semibold pr-2 pt-6">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            <div className="flex-1">
              {/* Month Titles row */}
              <div className="grid grid-cols-12 text-center text-[10px] text-gray-400 font-bold mb-1.5 pr-4">
                {monthsAbbr.map((m, idx) => (
                  <span key={idx}>{m}</span>
                ))}
              </div>

              {/* Grid cell layout */}
              <div className="grid grid-flow-col auto-cols-max gap-1">
                {heatmapData.map((day, idx) => (
                  <div
                    key={idx}
                    title={`${day.date} : ${day.count} activity`}
                    className={`w-3.5 h-3.5 rounded-sm transition cursor-pointer ${getShadeClass(day.count)}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-gray-400 font-semibold">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-100" />
                <div className="w-3 h-3 rounded-sm bg-blue-100" />
                <div className="w-3 h-3 rounded-sm bg-blue-300" />
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <div className="w-3 h-3 rounded-sm bg-[#004b87]" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balance Area Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="border-b border-gray-100 pb-4 mb-5">
            <h3 className="text-base font-bold text-[#0a2540]">Running Balance Progress</h3>
            <p className="text-xs text-gray-500">Cumulative capital movement trend over time</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#117aca" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#117aca" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#a0aec0" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#a0aec0"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => formatValue(v, true)}
                />
                <Tooltip
                  formatter={(value: any) => [formatValue(Number(value)), 'Cumulative Balance']}
                  contentStyle={{ backgroundColor: '#0a2540', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#117aca" strokeWidth={2} fillOpacity={1} fill="url(#balanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Flow Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">Monthly Cash Movement</h3>
              <p className="text-xs text-gray-500">Direct comparison of inbound vs outbound</p>
            </div>

            {/* Selection */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedYearCharts('All')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  selectedYearCharts === 'All' ? 'bg-[#004b87] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Years
              </button>
              {yearsList.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYearCharts(y)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    selectedYearCharts === y ? 'bg-[#004b87] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#a0aec0" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#a0aec0"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => formatValue(v, true)}
                />
                <Tooltip
                  formatter={(value: any) => [formatValue(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0a2540', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={10} iconType="circle" />
                <Bar dataKey="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Categories Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Outflow / Expense Category list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-[#0a2540]">Where the money went</h3>
            <p className="text-xs text-gray-500">Outflow distribution categorized by volume</p>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {categorizedExpenses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No outflows found.</p>
            ) : (
              categorizedExpenses.map((exp, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> {exp.category}
                    </span>
                    <span className="font-bold">{formatValue(exp.amount)} ({exp.percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${exp.percent}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inflow / Income Category list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-[#0a2540]">Where the money came from</h3>
            <p className="text-xs text-gray-500">Inflow distribution categorized by volume</p>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {categorizedIncomes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No inflows found.</p>
            ) : (
              categorizedIncomes.map((inc, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> {inc.category}
                    </span>
                    <span className="font-bold">{formatValue(inc.amount)} ({inc.percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${inc.percent}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Counterparties / Payees and Payers list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Payees (Debits) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-[#0a2540]">Top Payees</h3>
            <p className="text-xs text-gray-500">Largest cumulative outgoing cash destinations</p>
          </div>
          <div className="divide-y divide-gray-100">
            {topPayees.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No counterparties recorded.</p>
            ) : (
              topPayees.map((payee, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-[#004b87]/5 text-[#004b87] flex items-center justify-center font-bold text-[10px]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="font-bold text-gray-800">{payee.name}</div>
                      <div className="text-gray-400 mt-0.5">{payee.count} transactions</div>
                    </div>
                  </div>
                  <div className="font-bold text-red-600">{formatValue(payee.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Payers (Credits) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-[#0a2540]">Top Payers</h3>
            <p className="text-xs text-gray-500">Largest cumulative incoming cash sources</p>
          </div>
          <div className="divide-y divide-gray-100">
            {topPayers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No sources recorded.</p>
            ) : (
              topPayers.map((payer, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="font-bold text-gray-800">{payer.name}</div>
                      <div className="text-gray-400 mt-0.5">{payer.count} transactions</div>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600">{formatValue(payer.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics KPI Extra Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Largest Credit</div>
          <div className="text-lg font-black text-emerald-600 mt-1.5">{formatValue(largestCredit)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Largest Debit</div>
          <div className="text-lg font-black text-red-600 mt-1.5">{formatValue(largestDebit)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Monthly Debit</div>
          <div className="text-lg font-black text-gray-700 mt-1.5">{formatValue(averageMonthlyDebit)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Transaction</div>
          <div className="text-lg font-black text-gray-700 mt-1.5">{formatValue(metrics.avgInflow)}</div>
        </div>
      </div>
    </div>
  );
};

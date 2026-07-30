import React, { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, CalendarDays, BarChart3, Globe, Download, Sparkles, AlertTriangle } from 'lucide-react';
import type { ReportData } from './parser';

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

  // 1. Core metric card calculations
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

  // Year filter list
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
    const daysMap: { [key: string]: number } = {};
    report.transactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (d.getFullYear() === selectedYearHeatmap) {
        const key = tx.date;
        daysMap[key] = (daysMap[key] || 0) + 1;
      }
    });

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
        dayOfWeek: temp.getDay(),
        month: temp.getMonth()
      });
      temp.setDate(temp.getDate() + 1);
    }
    return dates;
  }, [report, selectedYearHeatmap]);

  const monthsAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getShadeClass = (count: number) => {
    if (count === 0) return 'bg-white hover:bg-gray-100 border border-gray-200/50';
    if (count <= 1) return 'bg-[#d1fae5] hover:bg-[#a7f3d0]'; // very light mint green
    if (count <= 2) return 'bg-[#6ee7b7] hover:bg-[#34d399]'; // light mint
    if (count <= 4) return 'bg-[#10b981] hover:bg-[#059669]'; // bright mint
    return 'bg-[#0F4A27] hover:bg-[#0B3C22]'; // dark green
  };

  // 3. Balance Over Time (Area Chart Data)
  const areaChartData = useMemo(() => {
    let runningBalance = 0;
    const sorted = [...report.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dataPoints: { name: string; balance: number }[] = [];

    sorted.forEach((tx) => {
      runningBalance += tx.amount;
      const formattedDate = new Date(tx.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

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

  // 5. Categorized breakdown analysis
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

  // 6. Payee and Payer Leaderboard
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
        const key = tx.date.substring(0, 7);
        monthlyMap[key] = (monthlyMap[key] || 0) + Math.abs(tx.amount);
      }
    });
    const months = Object.keys(monthlyMap);
    if (months.length === 0) return 0;
    const totalDebits = months.reduce((sum, m) => sum + monthlyMap[m], 0);
    return totalDebits / months.length;
  }, [report]);

  // ADVANCED FINANCIAL INTELLIGENCE CALCULATIONS
  const advancedAnalytics = useMemo(() => {
    const savingsRate = metrics.totalInflow > 0 ? (metrics.netFlow / metrics.totalInflow) * 100 : 0;
    let savingsGrade = 'Deficit Spend';
    let savingsColor = 'text-soft-coral bg-red-50 border-red-200';
    if (metrics.netFlow >= 0) {
      if (savingsRate >= 50) {
        savingsGrade = 'Elite Savings';
        savingsColor = 'text-bright-mint bg-[#122238]/20 border-bright-mint/30';
      } else if (savingsRate >= 30) {
        savingsGrade = 'Healthy / High Efficiency';
        savingsColor = 'text-bright-mint bg-emerald-50 border-emerald-200';
      } else if (savingsRate >= 10) {
        savingsGrade = 'Moderate Savings';
        savingsColor = 'text-bright-mint/80 bg-emerald-50/50 border-emerald-100';
      } else {
        savingsGrade = 'Low Efficiency';
        savingsColor = 'text-amber-700 bg-amber-50 border-amber-200';
      }
    }

    const monthlyNetMap: { [key: string]: number } = {};
    report.transactions.forEach(tx => {
      const key = tx.date.substring(0, 7);
      monthlyNetMap[key] = (monthlyNetMap[key] || 0) + tx.amount;
    });
    const sortedMonths = Object.keys(monthlyNetMap).sort();
    let momGrowth = 0;
    let momTrend: 'up' | 'down' | 'flat' = 'flat';
    if (sortedMonths.length >= 2) {
      const lastMonth = monthlyNetMap[sortedMonths[sortedMonths.length - 1]];
      const prevMonth = monthlyNetMap[sortedMonths[sortedMonths.length - 2]];
      if (prevMonth !== 0) {
        momGrowth = ((lastMonth - prevMonth) / Math.abs(prevMonth)) * 100;
        if (momGrowth > 0.5) momTrend = 'up';
        else if (momGrowth < -0.5) momTrend = 'down';
      }
    }

    const monthlyInflowMap: { [key: string]: number } = {};
    report.transactions.forEach(tx => {
      if (tx.amount >= 0) {
        const key = tx.date.substring(0, 7);
        monthlyInflowMap[key] = (monthlyInflowMap[key] || 0) + tx.amount;
      }
    });
    const sortedInflowMonths = Object.keys(monthlyInflowMap);
    const avgMonthlyInflow = sortedInflowMonths.length > 0
      ? sortedInflowMonths.reduce((sum, m) => sum + monthlyInflowMap[m], 0) / sortedInflowMonths.length
      : 0;

    const netBurnRate = averageMonthlyDebit - avgMonthlyInflow;
    const currentRunwayMonths = (netBurnRate > 0 && metrics.netFlow < 0)
      ? Math.max(0, metrics.netFlow / -netBurnRate)
      : null;

    const compoundFutureWealth = metrics.netFlow > 0
      ? metrics.netFlow * Math.pow(1 + 0.07, 5)
      : 0;

    const groups: { [key: string]: { amounts: number[]; dates: string[] } } = {};
    report.transactions.forEach(tx => {
      if (tx.amount < 0) {
        const words = tx.description.toLowerCase().split(/[ \-_]/).filter(w => w.length > 2);
        const key = words.slice(0, 2).join(' ') || tx.description.toLowerCase();
        if (!groups[key]) {
          groups[key] = { amounts: [], dates: [] };
        }
        groups[key].amounts.push(Math.abs(tx.amount));
        groups[key].dates.push(tx.date);
      }
    });

    const recurringList: { name: string; avgAmount: number; count: number }[] = [];
    Object.keys(groups).forEach(key => {
      const item = groups[key];
      if (item.dates.length >= 2) {
        const monthsSet = new Set(item.dates.map(d => d.substring(0, 7)));
        if (monthsSet.size >= 2) {
          const mean = item.amounts.reduce((sum, a) => sum + a, 0) / item.amounts.length;
          const isConsistent = item.amounts.every(a => Math.abs(a - mean) / mean < 0.35);
          if (isConsistent) {
            const originalTx = report.transactions.find(tx => {
              const words = tx.description.toLowerCase().split(/[ \-_]/).filter(w => w.length > 2);
              const originalKey = words.slice(0, 2).join(' ') || tx.description.toLowerCase();
              return originalKey === key;
            });
            recurringList.push({
              name: originalTx ? originalTx.description : key,
              avgAmount: mean,
              count: item.dates.length
            });
          }
        }
      }
    });

    return {
      savingsRate,
      savingsGrade,
      savingsColor,
      momGrowth,
      momTrend,
      currentRunwayMonths,
      netBurnRate,
      compoundFutureWealth,
      recurringList: recurringList.sort((a, b) => b.avgAmount - a.avgAmount).slice(0, 5)
    };
  }, [report, metrics, averageMonthlyDebit]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 min-w-0 overflow-hidden">
      {/* Header section with print trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5 print:hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-bright-mint uppercase tracking-wider select-none">
            <Globe className="w-4 h-4 shrink-0" /> Client-Side Certified Safe Report
          </div>
          <h2 className="text-2xl font-black text-dark-green mt-1 truncate">{report.title}</h2>
          <p className="text-sm text-gray-500 mt-1 truncate">
            Period: {new Date(report.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(report.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} &middot; {metrics.totalTransactions} transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition hover:shadow cursor-pointer select-none"
          >
            <Download className="w-4 h-4 shrink-0" /> Download PDF
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer select-none"
          >
            New Statement
          </button>
        </div>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-black text-dark-green">{report.title}</h1>
        <p className="text-sm text-gray-500">
          Statement Period: {report.startDate} to {report.endDate} &middot; Generated with WhatIEarn Profit Tracker
        </p>
      </div>

      {/* Top Level Numeric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between transition hover:shadow-md min-w-0">
          <div className="min-w-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block truncate">Total Inflow</span>
            <h3 className="text-2xl font-black text-bright-mint mt-1 truncate">{formatValue(metrics.totalInflow)}</h3>
            <span className="text-xs text-bright-mint bg-emerald-50 px-2 py-0.5 rounded font-semibold inline-block mt-2 truncate">
              {metrics.numInflow} credits
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-bright-mint shrink-0 ml-3">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between transition hover:shadow-md min-w-0">
          <div className="min-w-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block truncate">Total Outflow</span>
            <h3 className="text-2xl font-black text-soft-coral mt-1 truncate">{formatValue(metrics.totalOutflow)}</h3>
            <span className="text-xs text-soft-coral bg-red-50 px-2 py-0.5 rounded font-semibold inline-block mt-2 truncate">
              {metrics.numOutflow} debits
            </span>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-soft-coral shrink-0 ml-3">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between transition hover:shadow-md min-w-0">
          <div className="min-w-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block truncate">Net Flow</span>
            <h3 className={`text-2xl font-black mt-1 truncate ${metrics.netFlow >= 0 ? 'text-dark-green' : 'text-soft-coral'}`}>
              {formatValue(metrics.netFlow)}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold inline-block mt-2 truncate ${metrics.netFlow >= 0 ? 'text-bright-mint bg-emerald-50' : 'text-soft-coral bg-red-50'}`}>
              {metrics.netFlow >= 0 ? 'Positive Net' : 'Deficit'}
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-dark-green shrink-0 ml-3">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-between transition hover:shadow-md min-w-0">
          <div className="min-w-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block truncate">Closing Balance</span>
            <h3 className="text-2xl font-black text-dark-green mt-1 truncate">
              {formatValue(metrics.netFlow)}
            </h3>
            <span className="text-xs text-white bg-dark-green px-2 py-0.5 rounded font-semibold inline-block mt-2 truncate">
              {metrics.yearsDifference} years in view
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-dark-green shrink-0 ml-3">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* THREE INTEGRATED CAPITAL INTELLIGENCE CARDS (Deep Blue/Indigo bg-[#122238] border-[#1e3458]) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Capital Efficiency */}
        <div className="bg-[#122238] border border-[#1e3458] rounded-xl p-6 flex flex-col justify-between text-white min-w-0 shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-bright-mint block truncate">Capital Efficiency</span>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shrink-0 truncate ${advancedAnalytics.savingsColor}`}>
                {advancedAnalytics.savingsGrade}
              </span>
            </div>
            <h4 className="text-3xl font-black mb-1 truncate">{advancedAnalytics.savingsRate.toFixed(1)}%</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              The ratio of net capital retained relative to total incoming cash flow during the period. Higher represents elevated asset security.
            </p>
          </div>
          <div className="mt-6 w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                advancedAnalytics.savingsRate >= 30 ? 'bg-bright-mint' : 'bg-soft-coral'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, advancedAnalytics.savingsRate))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Runway / Growth Trend */}
        <div className="bg-[#122238] border border-[#1e3458] rounded-xl p-6 flex flex-col justify-between text-white min-w-0 shadow-lg">
          {metrics.netFlow >= 0 ? (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-bright-mint block mb-3 truncate">Wealth Forecast</span>
              <h4 className="text-2xl font-black text-bright-mint mb-1 truncate">{formatValue(advancedAnalytics.compoundFutureWealth)}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Projected compounding value of current net earnings in **5 years** at a conservative **7% annual yield** without extra deposits.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-bright-mint font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span className="truncate">Sustained growth compounds capital.</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-soft-coral flex items-center gap-1.5 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-soft-coral shrink-0" /> Cash Runway Alert
              </span>
              <h4 className="text-2xl font-black text-soft-coral mb-1 truncate">
                {advancedAnalytics.currentRunwayMonths !== null
                  ? `${advancedAnalytics.currentRunwayMonths.toFixed(1)} Months`
                  : 'Deficit Risk'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculated based on current burn rate ({formatValue(advancedAnalytics.netBurnRate)}/mo). Action is recommended to reduce recurring outlays.
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-300 font-bold">
            <span className="truncate">MoM Trend:</span>
            <span className="flex items-center gap-1 truncate font-black">
              {advancedAnalytics.momTrend === 'up' && (
                <span className="text-bright-mint flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" /> +{advancedAnalytics.momGrowth.toFixed(1)}%
                </span>
              )}
              {advancedAnalytics.momTrend === 'down' && (
                <span className="text-soft-coral flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5 shrink-0" /> {advancedAnalytics.momGrowth.toFixed(1)}%
                </span>
              )}
              {advancedAnalytics.momTrend === 'flat' && <span className="text-gray-400">Stable</span>}
            </span>
          </div>
        </div>

        {/* Card 3: Subscription Predictor */}
        <div className="bg-[#122238] border border-[#1e3458] rounded-xl p-6 flex flex-col justify-between text-white min-w-0 shadow-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-bright-mint block mb-3 truncate">Recurring Charges</span>
            {advancedAnalytics.recurringList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No regular monthly outlays detected.</p>
            ) : (
              <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                {advancedAnalytics.recurringList.map((rec, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs gap-3">
                    <div className="truncate min-w-0">
                      <div className="font-bold text-slate-100 truncate">{rec.name}</div>
                      <div className="text-[10px] text-slate-400">{rec.count} intervals</div>
                    </div>
                    <span className="font-bold text-soft-coral bg-red-950/40 border border-red-900/30 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                      ~{formatValue(rec.avgAmount)}/mo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spending Rhythm Heatmap */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarDays className="w-5 h-5 text-dark-green shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-dark-green truncate">Spending Rhythm Heatmap</h3>
              <p className="text-xs text-gray-500 truncate">Visualization of transaction frequency across daily grid</p>
            </div>
          </div>

          {/* Year filtering buttons */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {yearsList.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYearHeatmap(y)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                  selectedYearHeatmap === y
                    ? 'bg-dark-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Map Rendering */}
        <div className="overflow-x-auto pb-2">
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

              <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-gray-400 font-semibold select-none">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-white border border-gray-200" />
                <div className="w-3 h-3 rounded-sm bg-[#d1fae5]" />
                <div className="w-3 h-3 rounded-sm bg-[#6ee7b7]" />
                <div className="w-3 h-3 rounded-sm bg-[#10b981]" />
                <div className="w-3 h-3 rounded-sm bg-[#0F4A27]" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balance Area Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-w-0">
          <div className="border-b border-gray-100 pb-4 mb-5">
            <h3 className="text-base font-bold text-dark-green">Running Balance Progress</h3>
            <p className="text-xs text-gray-500">Cumulative capital movement trend over time</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                  contentStyle={{ backgroundColor: '#122238', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#balanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Flow Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-dark-green truncate">Monthly Cash Movement</h3>
              <p className="text-xs text-gray-500 truncate">Direct comparison of inbound vs outbound</p>
            </div>

            {/* Selection */}
            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              <button
                onClick={() => setSelectedYearCharts('All')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer select-none ${
                  selectedYearCharts === 'All' ? 'bg-dark-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Years
              </button>
              {yearsList.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYearCharts(y)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer select-none ${
                    selectedYearCharts === y ? 'bg-dark-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  contentStyle={{ backgroundColor: '#122238', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={10} iconType="circle" />
                <Bar dataKey="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Outflow" fill="#e06a55" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Categories Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Outflow / Expense Category list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-w-0">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-dark-green">Where the money went</h3>
            <p className="text-xs text-gray-500">Outflow distribution categorized by volume</p>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {categorizedExpenses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No outflows found.</p>
            ) : (
              categorizedExpenses.map((exp, idx) => (
                <div key={idx} className="space-y-1.5 min-w-0">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 gap-2">
                    <span className="flex items-center gap-2 truncate min-w-0">
                      <span className="w-2 h-2 rounded-full bg-soft-coral shrink-0" /> <span className="truncate">{exp.category}</span>
                    </span>
                    <span className="font-bold shrink-0">{formatValue(exp.amount)} ({exp.percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-soft-coral h-full rounded-full" style={{ width: `${exp.percent}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inflow / Income Category list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-w-0">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-dark-green">Where the money came from</h3>
            <p className="text-xs text-gray-500">Inflow distribution categorized by volume</p>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {categorizedIncomes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No inflows found.</p>
            ) : (
              categorizedIncomes.map((inc, idx) => (
                <div key={idx} className="space-y-1.5 min-w-0">
                  <div className="flex justify-between text-xs font-semibold text-gray-700 gap-2">
                    <span className="flex items-center gap-2 truncate min-w-0">
                      <span className="w-2 h-2 rounded-full bg-bright-mint shrink-0" /> <span className="truncate">{inc.category}</span>
                    </span>
                    <span className="font-bold shrink-0">{formatValue(inc.amount)} ({inc.percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-bright-mint h-full rounded-full" style={{ width: `${inc.percent}%` }} />
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-w-0">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-dark-green">Top Payees</h3>
            <p className="text-xs text-gray-500">Largest cumulative outgoing cash destinations</p>
          </div>
          <div className="divide-y divide-gray-100">
            {topPayees.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No counterparties recorded.</p>
            ) : (
              topPayees.map((payee, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded bg-[#122238]/5 text-dark-green flex items-center justify-center font-bold text-[10px] shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 truncate">
                      <div className="font-bold text-gray-800 truncate">{payee.name}</div>
                      <div className="text-gray-400 mt-0.5">{payee.count} transactions</div>
                    </div>
                  </div>
                  <div className="font-bold text-soft-coral shrink-0">{formatValue(payee.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Payers (Credits) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-w-0">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <h3 className="text-base font-bold text-dark-green">Top Payers</h3>
            <p className="text-xs text-gray-500">Largest cumulative incoming cash sources</p>
          </div>
          <div className="divide-y divide-gray-100">
            {topPayers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No sources recorded.</p>
            ) : (
              topPayers.map((payer, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded bg-emerald-50 text-bright-mint flex items-center justify-center font-bold text-[10px] shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 truncate">
                      <div className="font-bold text-gray-800 truncate">{payer.name}</div>
                      <div className="text-gray-400 mt-0.5">{payer.count} transactions</div>
                    </div>
                  </div>
                  <div className="font-bold text-bright-mint shrink-0">{formatValue(payer.amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics KPI Extra Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center min-w-0">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Largest Credit</div>
          <div className="text-lg font-black text-bright-mint mt-1.5 truncate">{formatValue(largestCredit)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center min-w-0">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Largest Debit</div>
          <div className="text-lg font-black text-soft-coral mt-1.5 truncate">{formatValue(largestDebit)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center min-w-0">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Avg Monthly Debit</div>
          <div className="text-lg font-black text-gray-700 mt-1.5 truncate">{formatValue(averageMonthlyDebit)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center min-w-0">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">Avg Transaction</div>
          <div className="text-lg font-black text-gray-700 mt-1.5 truncate">{formatValue(metrics.avgInflow)}</div>
        </div>
      </div>
    </div>
  );
};

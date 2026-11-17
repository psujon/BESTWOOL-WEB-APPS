import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Database, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Filter, 
  Loader2 
} from 'lucide-react';

const barColors = ['bg-sky-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];

export default function Overview({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartRange, setChartRange] = useState('last_6');
  const [selectedUnit, setSelectedUnit] = useState(localStorage.getItem('bw_selected_unit') || 'ALL');

  // Listen to unit switch events
  useEffect(() => {
    const handleUnitChange = (e) => {
      setSelectedUnit(e.detail || localStorage.getItem('bw_selected_unit') || 'ALL');
    };
    window.addEventListener('unit-changed', handleUnitChange);
    return () => window.removeEventListener('unit-changed', handleUnitChange);
  }, []);

  // Fetch stats whenever token, chartRange, or selectedUnit changes
  useEffect(() => {
    setChartLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };
    if (selectedUnit && selectedUnit !== 'ALL') {
      headers['x-unit-id'] = selectedUnit;
    }

    fetch(`http://localhost:5000/api/stats?chartRange=${chartRange}`, { headers })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
        setChartLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
        setChartLoading(false);
      });
  }, [token, chartRange, selectedUnit]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-sky-400 mr-2" />
        <span>ড্যাশবোর্ড লোড হচ্ছে...</span>
      </div>
    );
  }

  const cards = stats?.cards || [
    { title: 'TOTAL BUYERS', value: '0', change: 'নিবন্ধিত বায়িং হাউস', trend: 'up' },
    { title: 'ACTIVE STYLES', value: '0', change: 'রানিং স্টাইল', trend: 'up' },
    { title: 'TODAY PRODUCTION', value: '0 pcs', change: 'আজকের মোট উৎপাদন', trend: 'stable' },
    { title: 'ACTIVE EMPLOYEES', value: '0 জন', change: 'কারখানার স্টাফ', trend: 'up' }
  ];

  const productionOverview = stats?.productionOverview || [];
  const topBuyers = stats?.topBuyers || [];
  const periodInfo = stats?.periodInfo || {};

  // Dynamic max value calculation for 6-month chart scaling
  let maxVal = 100;
  productionOverview.forEach(item => {
    topBuyers.forEach(bName => {
      maxVal = Math.max(maxVal, item[bName] || 0);
    });
  });
  maxVal = Math.ceil(maxVal * 1.25);

  const recentActivities = stats?.recentActivities || [];

  const getIcon = (title) => {
    switch (title) {
      case 'TOTAL BUYERS': return <Users size={22} />;
      case 'ACTIVE STYLES': return <FileText size={22} />;
      case 'TODAY PRODUCTION': return <CheckCircle size={22} />;
      case 'ACTIVE EMPLOYEES': return <Users size={22} />;
      default: return <Database size={22} />;
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-emerald-400 mr-1 inline" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-rose-400 mr-1 inline" />;
    return <Minus size={16} className="text-slate-500 mr-1 inline" />;
  };

  const getCardColorClass = (trend) => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-rose-400';
    return 'text-slate-400';
  };

  // 6-Month Filter Step Navigation
  const handlePrev = () => {
    if (chartRange === 'last_6') setChartRange('prev_6');
    else if (chartRange === 'prev_6') setChartRange('prev_12');
    else if (chartRange === 'prev_12') setChartRange('offset_3');
    else if (chartRange.startsWith('offset_')) {
      const curOffset = parseInt(chartRange.split('_')[1], 10) || 0;
      setChartRange(`offset_${curOffset + 1}`);
    } else if (chartRange === '2026_h2') setChartRange('2026_h1');
    else if (chartRange === '2026_h1') setChartRange('2025_h2');
    else if (chartRange === '2025_h2') setChartRange('2025_h1');
    else setChartRange('prev_6');
  };

  const handleNext = () => {
    if (chartRange === 'offset_3') setChartRange('prev_12');
    else if (chartRange.startsWith('offset_')) {
      const curOffset = parseInt(chartRange.split('_')[1], 10) || 0;
      if (curOffset <= 2) setChartRange('prev_12');
      else setChartRange(`offset_${curOffset - 1}`);
    } else if (chartRange === 'prev_12') setChartRange('prev_6');
    else if (chartRange === 'prev_6') setChartRange('last_6');
    else if (chartRange === '2025_h1') setChartRange('2025_h2');
    else if (chartRange === '2025_h2') setChartRange('2026_h1');
    else if (chartRange === '2026_h1') setChartRange('2026_h2');
  };

  const isLatestRange = chartRange === 'last_6' || chartRange === '2026_h2';

  return (
    <div className="space-y-8">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-5 flex items-center justify-between shadow-xl" key={idx}>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <span className="text-2xl font-bold text-slate-100 mt-2 block font-display">{card.value}</span>
              <span className={`text-xs font-medium mt-1 ${getCardColorClass(card.trend)}`}>
                <span className="inline-flex items-center">
                  {getTrendIcon(card.trend)}
                  {card.change}
                </span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shadow-md">
              {getIcon(card.title)}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic 6-Month Production Chart */}
        <div className="lg:col-span-2 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative">
          
          {/* Chart Header with 6-Month Range Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/6">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-lg font-bold text-slate-100">প্রোডাকশন ওভারভিউ</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                  <Calendar size={13} className="text-sky-400" />
                  {periodInfo.label || 'চলতি ৬ মাস'}
                </span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {periodInfo.fullLabel || '৬ মাসের উৎপাদন ডাটা'}
                {periodInfo.totalQty > 0 && (
                  <span className="ml-2 text-emerald-400 font-semibold">
                    • মোট উৎপাদন: {periodInfo.totalQty.toLocaleString()} pcs
                  </span>
                )}
              </span>
            </div>

            {/* Filter Controls: Steppers & Dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Stepper Buttons */}
              <div className="flex items-center bg-[#0d1527] border border-white/10 rounded-lg p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded transition flex items-center gap-1"
                  title="পূর্ববর্তী ৬ মাস দেখুন"
                >
                  <ChevronLeft size={15} />
                  <span>পিছনের ৬ মাস</span>
                </button>
                <div className="w-[1px] h-4 bg-white/10 mx-0.5" />
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLatestRange}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded transition flex items-center gap-1 ${
                    isLatestRange 
                      ? 'text-slate-600 cursor-not-allowed opacity-50' 
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title="পরবর্তী ৬ মাস দেখুন"
                >
                  <span>পরবর্তী ৬ মাস</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Range Dropdown */}
              <div className="relative">
                <select
                  value={chartRange}
                  onChange={(e) => setChartRange(e.target.value)}
                  className="bg-[#0d1527] border border-white/10 text-slate-200 text-xs font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-sky-500 transition cursor-pointer shadow-sm appearance-none"
                >
                  <option value="last_6">⚡ চলতি ৬ মাস (জুন ২০২৬ - নভেম্বর ২০২৬)</option>
                  <option value="prev_6">⏮ বিগত ৬ মাস (ডিসেম্বর ২০২৫ - মে ২০২৬)</option>
                  <option value="prev_12">⏮ পূর্ববর্তী ৬ মাস (জুন ২০২৫ - নভেম্বর ২০২৫)</option>
                  <option disabled className="text-slate-500">──────────────</option>
                  <option value="2026_h2">📅 ২০২৬ দ্বিতীয়ার্ধ (জুলাই - ডিসেম্বর)</option>
                  <option value="2026_h1">📅 ২০২৬ প্রথমার্ধ (জানুয়ারি - জুন)</option>
                  <option value="2025_h2">📅 ২০২৫ দ্বিতীয়ার্ধ (জুলাই - ডিসেম্বর)</option>
                  <option value="2025_h1">📅 ২০২৫ প্রথমার্ধ (জানুয়ারি - জুন)</option>
                </select>
                <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 6-Month Chart Canvas */}
          <div className="h-64 flex items-end justify-between gap-3 md:gap-6 border-b border-white/6 pb-4 mb-4 mt-6 relative">
            {chartLoading && (
              <div className="absolute inset-0 bg-[#18223c]/60 backdrop-blur-xs flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="w-7 h-7 animate-spin text-sky-400" />
              </div>
            )}

            {productionOverview.map((item, index) => (
              <div className="flex-1 flex flex-col items-center h-full group" key={index}>
                {/* Monthly Total Quantity Pill on Hover */}
                <span className="text-[10px] text-sky-400 font-mono mb-1 font-semibold opacity-0 group-hover:opacity-100 transition duration-150">
                  {item.total > 0 ? `${item.total.toLocaleString()} pcs` : '0 pcs'}
                </span>

                {/* Bars for Top Buyers */}
                <div className="flex items-end justify-center gap-1.5 w-full h-full relative">
                  {topBuyers.map((bName, bIdx) => {
                    const val = item[bName] || 0;
                    const barHeight = Math.min(Math.max((val / maxVal) * 100, val > 0 ? 8 : 4), 100);
                    const colorClass = barColors[bIdx % barColors.length];

                    return (
                      <div 
                        key={bName}
                        className={`w-3.5 md:w-5 rounded-t transition-all duration-300 hover:brightness-125 hover:scale-y-105 origin-bottom shadow-md ${
                          val > 0 ? colorClass : 'bg-white/10'
                        }`}
                        style={{ height: `${barHeight}%` }} 
                        title={`${bName} (${item.fullLabel || item.month}): ${val.toLocaleString()} pcs`}
                      />
                    );
                  })}
                </div>

                {/* Month Name and Bengali Month Subtitle */}
                <div className="flex flex-col items-center mt-2.5">
                  <span className="text-[11px] text-slate-200 font-semibold group-hover:text-sky-400 transition">
                    {item.month}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {item.nameBn}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Chart Legend based strictly on Database Buyers */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-4 flex-wrap">
              {topBuyers.length === 0 ? (
                <span className="text-xs text-slate-500">কোন বায়ার তথ্য পাওয়া যায়নি</span>
              ) : (
                topBuyers.map((bName, bIdx) => (
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-medium" key={bName}>
                    <span className={`w-2.5 h-2.5 rounded-full ${barColors[bIdx % barColors.length]}`} />
                    <span>{bName}</span>
                  </div>
                ))
              )}
            </div>

            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 ml-auto">
              <span>পিরিয়ডের মোট উৎপাদন:</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">
                {(periodInfo.totalQty || 0).toLocaleString()} pcs
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Recent Activities */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-slate-100">সাম্প্রতিক কার্যক্রম</span>
          </div>
          <div className="space-y-4 mt-6">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">কোন সাম্প্রতিক কার্যক্রম পাওয়া যায়নি</p>
            ) : (
              recentActivities.map((act) => (
                <div className="flex items-start gap-3" key={act.id}>
                  <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0 shadow-md shadow-sky-500/30" />
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-200 leading-normal">
                      <strong className="text-sky-400">{act.user}: </strong>
                      {act.action}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

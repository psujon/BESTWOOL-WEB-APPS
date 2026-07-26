import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Database, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function Overview({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="text-slate-400">লোড হচ্ছে...</div>;
  }

  const cards = stats?.cards || [
    { title: 'Total Buyers', value: '14', change: '+2 new this month', trend: 'up' },
    { title: 'Active Styles', value: '42', change: '+8 running', trend: 'up' },
    { title: 'Today Production', value: '2,050 pcs', change: '93% efficiency', trend: 'stable' },
    { title: 'Yarn Stock', value: '4,520 kg', change: '-340 kg today', trend: 'down' }
  ];

  const productionOverview = stats?.productionOverview || [
    { month: 'Jan', H_M: 4500, Zara: 3200, Levis: 2100 },
    { month: 'Feb', H_M: 5200, Zara: 4100, Levis: 2800 },
    { month: 'Mar', H_M: 6100, Zara: 4900, Levis: 3100 },
    { month: 'Apr', H_M: 5800, Zara: 5200, Levis: 3500 },
    { month: 'May', H_M: 7100, Zara: 6000, Levis: 4200 },
    { month: 'Jun', H_M: 8500, Zara: 6800, Levis: 5100 }
  ];

  const recentActivities = stats?.recentActivities || [
    { id: 1, user: 'Admin', action: 'Added Style #SW-5021 for Zara', time: '10 mins ago' },
    { id: 2, user: 'Manager', action: 'Production Entry: 850 pcs completed', time: '34 mins ago' }
  ];

  const getIcon = (title) => {
    switch (title) {
      case 'Total Buyers': return <Users size={22} />;
      case 'Active Styles': return <FileText size={22} />;
      case 'Today Production': return <CheckCircle size={22} />;
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

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
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

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Production Chart */}
        <div className="lg:col-span-2 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-slate-100">প্রোডাকশন ওভারভিউ (চলতি বছর)</span>
            <span className="text-[11px] text-slate-400">ক্রেতা ভিত্তিক প্রোডাকশন রেট (pcs)</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 border-b border-white/6 pb-4 mb-4 mt-6">
            {productionOverview.map((item, index) => {
              const maxVal = 9000;
              const hMHeight = (item.H_M / maxVal) * 100;
              const zaraHeight = (item.Zara / maxVal) * 100;
              const levisHeight = (item.Levis / maxVal) * 100;

              return (
                <div className="flex-1 flex flex-col items-center h-full" key={index}>
                  <div className="flex items-end justify-center gap-1 w-full h-full relative">
                    <div 
                      className="w-2.5 md:w-3.5 rounded-t transition-all duration-300 hover:opacity-85 bg-sky-500 shadow-md shadow-sky-500/10" 
                      style={{ height: `${hMHeight}%` }} 
                      title={`H&M: ${item.H_M}`}
                    />
                    <div 
                      className="w-2.5 md:w-3.5 rounded-t transition-all duration-300 hover:opacity-85 bg-emerald-500 shadow-md shadow-emerald-500/10" 
                      style={{ height: `${zaraHeight}%` }} 
                      title={`Zara: ${item.Zara}`}
                    />
                    <div 
                      className="w-2.5 md:w-3.5 rounded-t transition-all duration-300 hover:opacity-85 bg-violet-500 shadow-md shadow-violet-500/10" 
                      style={{ height: `${levisHeight}%` }} 
                      title={`Levis: ${item.Levis}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>H&M</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Zara</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <span>Levis</span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-slate-100">সাম্প্রতিক কার্যক্রম</span>
          </div>
          <div className="space-y-4 mt-6">
            {recentActivities.map((act) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

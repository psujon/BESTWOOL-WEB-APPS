import React, { useState, useEffect } from 'react';
import { RefreshCw, BarChart2 } from 'lucide-react';

export default function ProductionShow({ token }) {
  const [productionList, setProductionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/production', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProductionList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching production logs:', err);
        setLoading(false);
      });
  }, [token, refresh]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm rounded-lg leading-relaxed">
        প্রোডাকশন রিপোর্ট শো পেজ। কারখানায় পূর্ববর্তী সময়ে এন্ট্রি করা সকল স্টাইলের উৎপাদনের বিস্তারিত বিবরণ এখানে দেখা যাবে।
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <BarChart2 size={18} className="text-sky-400" />
          উৎপাদন বিবরণী রিপোর্ট
        </h3>
        <button 
          onClick={() => setRefresh(!refresh)} 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-xs font-semibold"
        >
          <RefreshCw size={14} />
          রিফ্রেশ
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400">লোড হচ্ছে...</div>
      ) : (
        <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#131b2e] border-b border-white/6">
                <th className="py-3 px-4 text-slate-300 font-semibold">ক্রমিক নম্বর</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">স্টাইল কোড</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">বায়ার</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">উৎপাদন পরিমাণ</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {productionList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">
                    কোন প্রোডাকশন রেকর্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                productionList.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4"><strong className="text-sky-400">{item.style}</strong></td>
                    <td className="py-3.5 px-4 text-slate-200">{item.buyer}</td>
                    <td className="py-3.5 px-4"><strong className="text-emerald-400 font-bold">{item.qty.toLocaleString()} pcs</strong></td>
                    <td className="py-3.5 px-4 text-slate-300">{item.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

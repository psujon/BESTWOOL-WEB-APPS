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
        setProductionList(Array.isArray(data) ? data : []);
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
        প্রোডাকশন রিপোর্ট শো পেজ। ফ্লোর থেকে প্রাপ্ত সেকশন, স্টাইল, প্রসেস, কালার ও ইন্ডিভিজুয়াল কার্ড নম্বরের দৈনিক কাজের বিবরণী এখানে দেখা যাবে।
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
                <th className="py-3 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">সেকশন</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">স্টাইল নম্বর</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">প্রসেস</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">কালার</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">কার্ড নম্বর</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">কোয়ান্টিটি</th>
                <th className="py-3 px-4 text-slate-300 font-semibold">প্রোডাকশন ডেট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {productionList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">
                    কোন প্রোডাকশন রেকর্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                productionList.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{item.section_name || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {item.style_no || item.style || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{item.process_name || '—'}</td>
                    <td className="py-3.5 px-4 text-sky-400 font-semibold">{item.color_name || '—'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{item.card_no || '—'}</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      {Number(item.quantity || item.qty || 0).toLocaleString()} pcs
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {item.production_date ? new Date(item.production_date).toLocaleDateString() : (item.date || '—')}
                    </td>
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

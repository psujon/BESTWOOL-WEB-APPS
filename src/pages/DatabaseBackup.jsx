import React, { useState, useEffect } from 'react';
import { Database, PlusCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function DatabaseBackup({ token }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/backup', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBackups(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching backup logs:', err);
        setLoading(false);
      });
  }, [token, refresh]);

  const handleTriggerBackup = () => {
    setBackingUp(true);
    fetch('http://localhost:5000/api/backup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setBackingUp(false);
        setRefresh(!refresh);
      })
      .catch(err => {
        console.error('Backup error:', err);
        setBackingUp(false);
      });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm rounded-lg leading-relaxed">
        ডাটাবেজ ব্যাকআপ প্যানেল। এখান থেকে আপনি সিস্টেমে রক্ষিত সকল তথ্যের ব্যাকআপ (SQL format) সংগ্রহ করতে পারবেন। ডাম্প ফাইলগুলো ডেভলপমেন্ট সার্ভারে সুরক্ষিতভাবে সংরক্ষণ করা হবে।
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Database size={18} className="text-sky-400" />
            ম্যানুয়াল ডাটাবেজ ব্যাকআপ
          </h3>
          
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            ব্যাকআপ বাটনে ক্লিক করলে সিস্টেম সম্পূর্ণ MySQL ডাটাবেজ স্ট্রাকচার ও ডেটার স্ন্যাপশট নিয়ে একটি `.sql` ফাইল তৈরি করবে। ব্যাকআপের গতি ফাইল সাইজের উপর ভিত্তি করে পরিবর্তিত হতে পারে।
          </p>

          <button 
            onClick={handleTriggerBackup} 
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-sm font-semibold flex items-center justify-center gap-2"
            disabled={backingUp}
          >
            {backingUp ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>ব্যাকআপ নেওয়া হচ্ছে...</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>নতুন ব্যাকআপ নিন</span>
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">ব্যাকআপ নেওয়ার ইতিহাস (History)</h3>
            <span className="text-xs text-slate-400">মোট ব্যাকআপ: {backups.length} টি</span>
          </div>

          {loading ? (
            <div className="text-slate-400">লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold">ফাইল নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ব্যাকআপ সময়</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ফাইলের সাইজ</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {backups.map((bk) => (
                    <tr key={bk.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3.5 px-4 text-sky-400 font-semibold break-all">{bk.backup_name}</td>
                      <td className="py-3.5 px-4 text-slate-200">{new Date(bk.backup_date).toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-300">{bk.file_size}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1">
                          <CheckCircle2 size={12} />
                          {bk.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

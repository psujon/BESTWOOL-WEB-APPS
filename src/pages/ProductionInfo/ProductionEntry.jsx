import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';

export default function ProductionEntry({ token }) {
  const [style, setStyle] = useState('ST-9902');
  const [buyer, setBuyer] = useState('H&M');
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!qty || isNaN(qty)) return;

    setLoading(true);
    setMessage('');
    setIsError(false);

    fetch('http://localhost:5000/api/production', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ style, buyer, qty: parseInt(qty) })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to record production entry');
        return res.json();
      })
      .then(data => {
        setLoading(false);
        setMessage('✅ প্রোডাকশন এন্ট্রি সফলভাবে সম্পন্ন হয়েছে!');
        setQty('');
      })
      .catch(err => {
        setLoading(false);
        setMessage(`❌ ${err.message}`);
        setIsError(true);
      });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm rounded-lg leading-relaxed">
        দৈনিক প্রোডাকশন এন্ট্রি ফর্ম। কারখানার ফ্লোর থেকে সম্পন্ন করা কাজের পরিমাণ এখানে এন্ট্রি করুন। এই তথ্য রিয়েল-টাইমে ড্যাশবোর্ড ও প্রোডাকশন শো পেইজে যুক্ত হবে।
      </div>

      <div className="max-w-xl bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full mx-auto">
        <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
          <PlayCircle size={18} className="text-sky-400" />
          प्रোডাকশন এন্ট্রি করুন
        </h3>

        {message && (
          <div 
            className={`mb-5 p-3.5 border rounded-lg text-sm ${
              isError 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">স্টাইল কোড *</label>
            <select 
              className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              value={style} 
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="ST-9902">ST-9902 (H&M Crewneck)</option>
              <option value="PL-5510">PL-5510 (Zara Polo)</option>
              <option value="JN-8032">JN-8032 (Levi Denim)</option>
              <option value="HD-1022">HD-1022 (Walmart Hoodie)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">বায়ার *</label>
            <select 
              className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              value={buyer} 
              onChange={(e) => setBuyer(e.target.value)}
            >
              <option value="H&M">H&M</option>
              <option value="Zara">Zara</option>
              <option value="Levi Strauss & Co.">Levi Strauss & Co.</option>
              <option value="Walmart Inc.">Walmart Inc.</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">উৎপাদন কোয়ান্টিটি (pcs) *</label>
            <input 
              type="number" 
              className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="উদাহরন: 500" 
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold pt-2"
            disabled={loading}
          >
            {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}

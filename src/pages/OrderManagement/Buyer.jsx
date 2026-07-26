import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Buyer({ token }) {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [editingId, setEditingId] = useState(null);

  // Fetch buyers on mount
  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/buyers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBuyers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching buyers:', err);
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !country) {
      toast.error('বায়ার নাম ও দেশের নাম পূরণ করা বাধ্যতামূলক!');
      return;
    }

    const payload = { name, country, email, phone };

    if (editingId !== null) {
      // Update DB
      fetch(`http://localhost:5000/api/buyers/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update buyer');
          return data;
        })
        .then(() => {
          toast.success('বায়ার তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
          setEditingId(null);
          resetForm();
          fetchBuyers();
        })
        .catch(err => toast.error(err.message));
    } else {
      // Create DB
      fetch('http://localhost:5000/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save buyer');
          return data;
        })
        .then(() => {
          toast.success('নতুন বায়ার সফলভাবে যুক্ত করা হয়েছে!');
          resetForm();
          fetchBuyers();
        })
        .catch(err => toast.error(err.message));
    }
  };

  const resetForm = () => {
    setName('');
    setCountry('');
    setEmail('');
    setPhone('');
  };

  const handleEdit = (buyer) => {
    setEditingId(buyer.id);
    setName(buyer.name);
    setCountry(buyer.country);
    setEmail(buyer.email || '');
    setPhone(buyer.phone || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই বায়ারটি ডিলিট করতে চান?')) {
      fetch(`http://localhost:5000/api/buyers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete buyer');
          return data;
        })
        .then(() => {
          toast.success('বায়ার রেকর্ড সফলভাবে ডিলিট করা হয়েছে!');
          fetchBuyers();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm rounded-lg leading-relaxed">
        বায়ার ইনফরমেশন ম্যানেজমেন্ট পেজ। এখান থেকে সিস্টেমে নতুন বায়ার যুক্ত করা, সংশোধন (Edit) এবং ডিলিট (Delete) করা যাবে।
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Card (Add/Edit) */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <UserPlus size={18} className="text-sky-400" />
            {editingId !== null ? 'বায়ার তথ্য সংশোধন' : 'নতুন বায়ার যুক্ত করুন'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">বায়ার এর নাম *</label>
              <input 
                type="text" 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="উদা. H&M" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">দেশ (Country) *</label>
              <input 
                type="text" 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                placeholder="Sweden" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ইমেইল এড্রেস</label>
              <input 
                type="email" 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="hm@buyer.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ফোন নম্বর</label>
              <input 
                type="text" 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="+46 8 ..." 
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'সংরক্ষণ করুন'}
              </button>
              {editingId !== null && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit} 
                  className="bg-white/5 border border-white/6 hover:bg-white/10 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-sm"
                >
                  <XCircle size={16} />
                  <span>বাতিল</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">বায়ার তালিকা</h3>
            <span className="text-xs text-slate-400">মোট বায়ার: {buyers.length} জন</span>
          </div>

          {loading ? (
            <div className="text-slate-400">লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">বায়ার নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">দেশ</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ইমেইল</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ফোন নম্বর</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {buyers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500">
                        কোন বায়ার রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    buyers.map((buyer, index) => (
                      <tr key={buyer.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4"><strong className="text-sky-400">{buyer.name}</strong></td>
                        <td className="py-3.5 px-4 text-slate-200">{buyer.country}</td>
                        <td className="py-3.5 px-4 text-slate-300">{buyer.email || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-300">{buyer.phone || '—'}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handleEdit(buyer)} 
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(buyer.id)} 
                              className="inline-flex items-center justify-center w-8 h-8 border border-red-500/10 rounded-lg text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                              title="ডিলিট করুন"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

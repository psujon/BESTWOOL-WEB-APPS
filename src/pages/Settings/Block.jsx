import React, { useState, useEffect } from 'react';
import { Layers, Edit, Trash2, XCircle, Grid } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Block({ token }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('Active');

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBlocks();
  }, [token]);

  const fetchBlocks = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/blocks', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBlocks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching blocks:', err);
        toast.error('ব্লক/লাইন লোড করতে সমস্যা হয়েছে');
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      toast.error('দয়া করে ব্লক/লাইনের নাম লিখুন!');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code ? code.trim() : '',
      status
    };

    if (editingId !== null) {
      fetch(`http://localhost:5000/api/blocks/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update block');
          return data;
        })
        .then(() => {
          toast.success('ব্লক/লাইন সফলভাবে সংশোধন করা হয়েছে!');
          setEditingId(null);
          resetForm();
          fetchBlocks();
        })
        .catch(err => toast.error(err.message));
    } else {
      fetch('http://localhost:5000/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save block');
          return data;
        })
        .then(() => {
          toast.success('নতুন ব্লক/লাইন সফলভাবে সংরক্ষণ করা হয়েছে!');
          resetForm();
          fetchBlocks();
        })
        .catch(err => toast.error(err.message));
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setStatus('Active');
  };

  const handleEdit = (blk) => {
    setEditingId(blk.id);
    setName(blk.name || '');
    setCode(blk.code || '');
    setStatus(blk.status || 'Active');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই ব্লক/লাইন রেকর্ডটি ডিলিট করতে চান?')) {
      fetch(`http://localhost:5000/api/blocks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete block');
          return data;
        })
        .then(() => {
          toast.success('ব্লক/লাইন সফলভাবে ডিলিট করা হয়েছে!');
          if (editingId === id) handleCancelEdit();
          fetchBlocks();
        })
        .catch(err => toast.error(err.message));
    }
  };

  const getStatusBadge = (st) => {
    return st === 'Active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
        Closed
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full space-y-4">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 pb-3 border-b border-white/6">
            <Grid size={18} className="text-sky-400" />
            {editingId !== null ? 'ব্লক/লাইন সংশোধন করুন' : 'নতুন ব্লক/লাইন যোগ করুন'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">ব্লক/লাইনের নাম *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="উদা. Block A, Line-01"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">ব্লক/লাইন কোড (ঐচ্ছিক)</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="উদা. BLK-01"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">স্ট্যাটাস</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold"
              >
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

        {/* Data List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Layers size={18} className="text-sky-400" />
              <span>ব্লক / লাইন তালিকা</span>
            </h3>
            <span className="text-xs text-slate-400">মোট ব্লক/লাইন: <strong className="text-sky-400 font-bold">{blocks.length}</strong> টি</span>
          </div>

          {loading ? (
            <div className="text-slate-400 text-sm">ডাটা লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">ব্লক/লাইনের নাম</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">কোড</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">স্ট্যাটাস</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {blocks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-500">
                        কোনো ব্লক/লাইন ডাটা পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    blocks.map((blk, index) => (
                      <tr key={blk.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-sky-400">{blk.name}</td>
                        <td className="py-3.5 px-4 text-slate-200">{blk.code || '—'}</td>
                        <td className="py-3.5 px-4">{getStatusBadge(blk.status)}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(blk)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(blk.id)}
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


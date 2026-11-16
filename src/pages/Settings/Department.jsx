import React, { useState, useEffect } from 'react';
import { Building2, Edit, Trash2, XCircle, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Department({ token }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('Active');

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, [token]);

  const fetchDepartments = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/departments', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setDepartments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching departments:', err);
        toast.error('ডিপার্টমেন্ট লোড করতে সমস্যা হয়েছে');
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      toast.error('দয়া করে ডিপার্টমেন্টের নাম লিখুন!');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code ? code.trim() : '',
      status
    };

    if (editingId !== null) {
      fetch(`http://localhost:5000/api/departments/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update department');
          return data;
        })
        .then(() => {
          toast.success('ডিপার্টমেন্ট সফলভাবে সংশোধন করা হয়েছে!');
          setEditingId(null);
          resetForm();
          fetchDepartments();
        })
        .catch(err => toast.error(err.message));
    } else {
      fetch('http://localhost:5000/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save department');
          return data;
        })
        .then(() => {
          toast.success('নতুন ডিপার্টমেন্ট সফলভাবে সংরক্ষণ করা হয়েছে!');
          resetForm();
          fetchDepartments();
        })
        .catch(err => toast.error(err.message));
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setStatus('Active');
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setName(dept.name || '');
    setCode(dept.code || '');
    setStatus(dept.status || 'Active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই ডিপার্টমেন্টটি মুছে ফেলতে চান?')) {
      fetch(`http://localhost:5000/api/departments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete department');
          return data;
        })
        .then(() => {
          toast.success('ডিপার্টমেন্ট সফলভাবে মুছে ফেলা হয়েছে!');
          fetchDepartments();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  const getStatusBadge = (deptStatus) => {
    return deptStatus === 'Active' ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        Closed
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Building2 size={18} className="text-sky-400" />
            {editingId !== null ? 'ডিপার্টমেন্ট সংশোধন করুন' : 'নতুন ডিপার্টমেন্ট যুক্ত করুন'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                ডিপার্টমেন্টের নাম <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: Knitting, Finishing, Dyeing"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ডিপার্টমেন্ট কোড</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="যেমন: DEPT-01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">অবস্থা (Status)</label>
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
                {editingId !== null ? 'হালনাগাদ (Update)' : 'ডিপার্টমেন্ট যুক্ত করুন'}
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
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Building2 size={18} className="text-sky-400" />
              <span>ডিপার্টমেন্ট তালিকা</span>
            </h3>
            <span className="text-xs text-slate-400">মোট ডিপার্টমেন্ট: {departments.length} টি</span>
          </div>

          {loading ? (
            <div className="text-slate-400 py-8 text-center bg-[#18223c]/50 rounded-2xl border border-white/6">
              লোড হচ্ছে...
            </div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold w-14 text-center">ক্রমিক</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">কোড</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ডিপার্টমেন্টের নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">আওতাধীন সেকশন</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অবস্থা</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-500">
                        কোনো ডিপার্টমেন্ট রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept, index) => (
                      <tr key={dept.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 text-center">{index + 1}</td>
                        <td className="py-3.5 px-4 text-slate-200">
                          <strong>{dept.code || '—'}</strong>
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="text-sky-400">{dept.name}</strong>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            <Layers size={12} />
                            {dept._count?.sections ?? 0} টি
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">{getStatusBadge(dept.status)}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(dept)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(dept.id)}
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

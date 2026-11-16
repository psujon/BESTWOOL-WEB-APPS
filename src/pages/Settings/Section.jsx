import React, { useState, useEffect } from 'react';
import { Layers, Edit, Trash2, XCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Section({ token }) {
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('Active');

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSections();
    fetchDepartments();
  }, [token]);

  const fetchSections = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/sections', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sections:', err);
        toast.error('সেকশন তালিকা লোড করতে সমস্যা হয়েছে');
        setLoading(false);
      });
  };

  const fetchDepartments = () => {
    fetch('http://localhost:5000/api/departments', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching departments:', err);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error('সেকশনের নাম ও কোড বাধ্যতামূলক!');
      return;
    }

    const payload = {
      name: name.trim(),
      code: code.trim(),
      department_id: departmentId ? parseInt(departmentId) : null,
      status
    };

    if (editingId !== null) {
      fetch(`http://localhost:5000/api/sections/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update section');
          return data;
        })
        .then(() => {
          toast.success('সেকশন সফলভাবে সংশোধন করা হয়েছে!');
          setEditingId(null);
          resetForm();
          fetchSections();
        })
        .catch(err => toast.error(err.message));
    } else {
      fetch('http://localhost:5000/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save section');
          return data;
        })
        .then(() => {
          toast.success('নতুন সেকশন সফলভাবে সংরক্ষণ করা হয়েছে!');
          resetForm();
          fetchSections();
        })
        .catch(err => toast.error(err.message));
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setDepartmentId('');
    setStatus('Active');
  };

  const handleEdit = (sec) => {
    setEditingId(sec.id);
    setName(sec.name || '');
    setCode(sec.code || '');
    setDepartmentId(sec.department_id ? String(sec.department_id) : '');
    setStatus(sec.status || 'Active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই সেকশনটি ডিলিট করতে চান?')) {
      fetch(`http://localhost:5000/api/sections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete section');
          return data;
        })
        .then(() => {
          toast.success('সেকশন সফলভাবে মুছে ফেলা হয়েছে!');
          fetchSections();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  const getStatusBadge = (secStatus) => {
    return secStatus === 'Active' ? (
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
            <Layers size={18} className="text-sky-400" />
            {editingId !== null ? 'সেকশন সংশোধন করুন' : 'নতুন সেকশন যুক্ত করুন'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                আওতাধীন ডিপার্টমেন্ট <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                <option value="">-- ডিপার্টমেন্ট সিলেক্ট করুন --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} {dept.code ? `(${dept.code})` : ''}
                  </option>
                ))}
              </select>
              {departments.length === 0 && (
                <span className="text-xs text-amber-400 mt-1 block">
                  * আগে সেটিংস থেকে ডিপার্টমেন্ট তৈরি করুন
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                সেকশন এর নাম <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: Knitting / Dyeing"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                সেকশন কোড <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="যেমন: KN-01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">স্ট্যাটাস</label>
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
                {editingId !== null ? 'হালনাগাদ (Update)' : 'সেকশন যুক্ত করুন'}
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
              <Layers size={18} className="text-sky-400" />
              <span>সেকশন তালিকা</span>
            </h3>
            <span className="text-xs text-slate-400">মোট সেকশন: {sections.length} টি</span>
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
                    <th className="py-3 px-4 text-slate-300 font-semibold">সেকশন এর নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ডিপার্টমেন্ট</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অবস্থা</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {sections.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-500">
                        কোন সেকশন রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    sections.map((sec, index) => (
                      <tr key={sec.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 text-center">{index + 1}</td>
                        <td className="py-3.5 px-4 text-slate-200">
                          <strong>{sec.code}</strong>
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="text-sky-400">{sec.name}</strong>
                        </td>
                        <td className="py-3.5 px-4">
                          {sec.department ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              <Building2 size={12} />
                              {sec.department.name}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs italic">কোন ডিপার্টমেন্ট নেই</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">{getStatusBadge(sec.status)}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(sec)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(sec.id)}
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

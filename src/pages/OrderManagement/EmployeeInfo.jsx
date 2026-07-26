import React, { useState, useEffect } from 'react';
import { UserCheck, Edit, Trash2, XCircle, Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EmployeeInfo({ token }) {
  const [employees, setEmployees] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [cardNo, setCardNo] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [joinDate, setJoinDate] = useState(getTodayDateString());
  const [sectionId, setSectionId] = useState('');

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchSections();
  }, []);

  const fetchSections = () => {
    fetch('http://localhost:5000/api/sections', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching sections:', err));
  };

  const fetchEmployees = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/employees', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching employees:', err);
        toast.error('ইমপ্লয়ী তথ্য লোড করতে ব্যর্থ হয়েছে');
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardNo || !name || !designation || !joinDate || !sectionId) {
      toast.error('দয়া করে কার্ড নং, নাম, পদবী, জয়েন ডেট ও সেকশন পূরণ করুন!');
      return;
    }

    const payload = {
      card_no: cardNo,
      name,
      designation,
      join_date: joinDate,
      section_id: parseInt(sectionId)
    };

    if (editingId !== null) {
      fetch(`http://localhost:5000/api/employees/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update employee');
          return data;
        })
        .then(() => {
          toast.success('ইমপ্লয়ী তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
          setEditingId(null);
          resetForm();
          fetchEmployees();
        })
        .catch(err => toast.error(err.message));
    } else {
      fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save employee');
          return data;
        })
        .then(() => {
          toast.success('নতুন একটিভ ইমপ্লয়ী সফলভাবে যুক্ত করা হয়েছে!');
          resetForm();
          fetchEmployees();
        })
        .catch(err => toast.error(err.message));
    }
  };

  const resetForm = () => {
    setCardNo('');
    setName('');
    setDesignation('');
    setJoinDate(getTodayDateString());
    setSectionId('');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setCardNo(item.card_no || '');
    setName(item.name || '');
    setDesignation(item.designation || '');
    setSectionId(item.section_id || '');

    if (item.join_date) {
      const dbDate = new Date(item.join_date);
      const year = dbDate.getFullYear();
      const month = String(dbDate.getMonth() + 1).padStart(2, '0');
      const day = String(dbDate.getDate()).padStart(2, '0');
      setJoinDate(`${year}-${month}-${day}`);
    } else {
      setJoinDate(getTodayDateString());
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই ইমপ্লয়ী রেকর্ডটি ডিলিট করতে চান?')) {
      fetch(`http://localhost:5000/api/employees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete employee');
          return data;
        })
        .then(() => {
          toast.success('ইমপ্লয়ী রেকর্ড সফলভাবে ডিলিট করা হয়েছে!');
          fetchEmployees();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <UserCheck size={18} className="text-sky-400" />
            {editingId !== null ? 'ইমপ্লয়ী তথ্য সংশোধন' : 'নতুন ইমপ্লয়ী যুক্ত করুন'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">কার্ড নম্বর (Card No) *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={cardNo}
                onChange={(e) => setCardNo(e.target.value)}
                placeholder=""
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">কর্মকর্তা / কর্মচারীর নাম *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=""
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">পদবী (Designation) *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder=""
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">সেকশন (Section) *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                required
              >
                <option value="">Select Section</option>
                {sections?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">জয়েনিং ডেট (Join Date) *</label>
              <input
                type="date"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'ইমপ্লয়ী যুক্ত করুন'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-white/5 border border-white/6 hover:bg-white/10 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 text-sm"
                >
                  <XCircle size={16} />
                  <span>বাতিল</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Active Employee Table List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">একটিভ ইমপ্লয়ী তালিকা</h3>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
              একটিভ স্টাফ: {employees.length} জন
            </span>
          </div>

          {loading ? (
            <div className="text-slate-400">লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">কার্ড নং</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">পদবী</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">সেকশন</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">জয়েন ডেট</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-500">
                        কোন একটিভ ইমপ্লয়ী রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp, index) => (
                      <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-100">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {emp.card_no}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{emp.name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{emp.designation}</td>
                        <td className="py-3.5 px-4 text-sky-400 font-medium">{emp.section_name || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {emp.join_date ? new Date(emp.join_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(emp)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id)}
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

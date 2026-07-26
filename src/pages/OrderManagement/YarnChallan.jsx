import React, { useState, useEffect } from 'react';
import { Truck, Edit, Trash2, XCircle } from 'lucide-react';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function YarnChallan({ token }) {
  const [challans, setChallans] = useState([]);
  const [sections, setSections] = useState([]);
  const [styles, setStyles] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [sectionId, setSectionId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [processId, setProcessId] = useState('');
  const [colorId, setColorId] = useState('');
  const [challanNo, setChallanNo] = useState('');
  const [gatePassNo, setGatePassNo] = useState('');
  const [challanDate, setChallanDate] = useState(getTodayDateString());
  const [quantity, setQuantity] = useState('');
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchChallans();
    fetchSections();
    fetchStyles();
    fetchProcesses();
    fetchColors();
  }, []);

  const fetchSections = () => {
    fetch('http://localhost:5000/api/sections', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching sections:', err));
  };

  const fetchStyles = () => {
    fetch('http://localhost:5000/api/styles', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStyles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching styles:', err));
  };

  const fetchProcesses = () => {
    fetch('http://localhost:5000/api/processes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProcesses(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching processes:', err));
  };

  const fetchColors = () => {
    fetch('http://localhost:5000/api/colors', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setColors(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching colors:', err));
  };

  const fetchChallans = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/yarn-challans', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setChallans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching challans:', err);
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sectionId || !styleId || !processId || !colorId || !challanNo || !gatePassNo || !challanDate || !quantity) return;

    const payload = {
      section_id: parseInt(sectionId),
      style_id: parseInt(styleId),
      process_id: parseInt(processId),
      color_id: parseInt(colorId),
      challan_no: challanNo,
      gate_pass_no: gatePassNo,
      challan_date: challanDate,
      quantity: parseInt(quantity)
    };

    if (editingId !== null) {
      fetch(`http://localhost:5000/api/yarn-challans/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update yarn challan');
          setEditingId(null);
          fetchChallans();
        })
        .catch(err => alert(err.message));
    } else {
      fetch('http://localhost:5000/api/yarn-challans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to save yarn challan');
          fetchChallans();
        })
        .catch(err => alert(err.message));
    }

    setSectionId('');
    setStyleId('');
    setProcessId('');
    setColorId('');
    setChallanNo('');
    setGatePassNo('');
    setChallanDate(getTodayDateString());
    setQuantity('');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setSectionId(item.section_id || '');
    setStyleId(item.style_id || '');
    setProcessId(item.process_id || '');
    setColorId(item.color_id || '');
    setChallanNo(item.challan_no || '');
    setGatePassNo(item.gate_pass_no || '');
    setQuantity(item.quantity.toString());
    
    if (item.challan_date) {
      const dbDate = new Date(item.challan_date);
      const year = dbDate.getFullYear();
      const month = String(dbDate.getMonth() + 1).padStart(2, '0');
      const day = String(dbDate.getDate()).padStart(2, '0');
      setChallanDate(`${year}-${month}-${day}`);
    } else {
      setChallanDate(getTodayDateString());
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSectionId('');
    setStyleId('');
    setProcessId('');
    setColorId('');
    setChallanNo('');
    setGatePassNo('');
    setChallanDate(getTodayDateString());
    setQuantity('');
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই চালানটি ডিলিট করতে চান?')) {
      fetch(`http://localhost:5000/api/yarn-challans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete challan');
          fetchChallans();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => alert(err.message));
    }
  };

  const filteredProcesses = processes.filter(p => p.section_id === parseInt(sectionId));

  const filteredColors = colors.filter(c => 
    c.section_id === parseInt(sectionId) && 
    c.style_id === parseInt(styleId) && 
    c.process_id === parseInt(processId)
  );

  return (
    <div className="space-y-6">
      <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm rounded-lg leading-relaxed">
        নতুন ইয়ার্ন চালান (Yarn Challan) এন্ট্রি পেজ।
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Truck size={18} className="text-sky-400" />
            {editingId !== null ? 'চালান সংশোধন করুন' : 'নতুন চালান এন্ট্রি'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">সেকশন (Section) *</label>
              <select 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={sectionId} 
                onChange={(e) => {
                  setSectionId(e.target.value);
                  setProcessId(''); 
                  setColorId('');
                }} 
                required
              >
                <option value="">Select Section</option>
                {sections?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">স্টাইল নম্বর *</label>
              <select 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={styleId} 
                onChange={(e) => {
                  setStyleId(e.target.value);
                  setColorId('');
                }} 
                required
              >
                <option value="">Select Style</option>
                {styles?.map((st) => (
                  <option key={st.id} value={st.id}>{st.style_no}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">প্রসেস *</label>
              <select 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={processId} 
                onChange={(e) => {
                  setProcessId(e.target.value);
                  setColorId('');
                }} 
                required
                disabled={!sectionId}
              >
                <option value="">{sectionId ? "Select Process" : "First select a section"}</option>
                {filteredProcesses.map((p) => (
                  <option key={p.id} value={p.id}>{p.process_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">রং (Color) *</label>
              <select 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={colorId} 
                onChange={(e) => setColorId(e.target.value)} 
                required
                disabled={!processId || !styleId}
              >
                <option value="">{processId && styleId ? "Select Color" : "Select process & style first"}</option>
                {filteredColors.map((c) => (
                  <option key={c.id} value={c.id}>{c.color_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">চালান নং *</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={challanNo} 
                  onChange={(e) => setChallanNo(e.target.value)} 
                  placeholder="CH-88021" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">গেট পাস নং *</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={gatePassNo} 
                  onChange={(e) => setGatePassNo(e.target.value)} 
                  placeholder="GP-9903" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">চালান ডেট *</label>
              <input 
                type="date" 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={challanDate} 
                onChange={(e) => setChallanDate(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">কোয়ানটিটি *</label>
              <input 
                type="number" 
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                placeholder="5000" 
                required 
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'চালান সংরক্ষণ করুন'}
              </button>
              {editingId !== null && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit} 
                  className="bg-white/5 border border-white/6 hover:bg-white/10 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-sm"
                >
                  <XCircle size={16} />
                  <span>বাতিল</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">ইয়ার্ন চালান তালিকা</h3>
            <span className="text-xs text-slate-400">মোট চালান: {challans.length} টি</span>
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
                    <th className="py-3 px-4 text-slate-300 font-semibold">স্টাইল</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">প্রসেস</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">কালার</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">চালান নং</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">গেট পাস নং</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">চালান ডেট</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">কোয়ানটিটি</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {challans.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-8 text-slate-500">
                        কোন চালান রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    challans.map((item, index) => (
                      <tr key={item.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{item.section_name || '—'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {item.style_no || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{item.process_name || '—'}</td>
                        <td className="py-3.5 px-4 text-sky-400 font-semibold">{item.color_name || '—'}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{item.challan_no}</td>
                        <td className="py-3.5 px-4 text-slate-300">{item.gate_pass_no}</td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {item.challan_date ? new Date(item.challan_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">
                          {Number(item.quantity).toLocaleString()} pcs
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handleEdit(item)} 
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)} 
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

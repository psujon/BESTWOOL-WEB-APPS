import React, { useState, useEffect } from 'react';
import { Warehouse, Edit, Trash2, XCircle, Building2, Search, CheckCircle2, Phone, MapPin, RefreshCw, PlusCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Unit({ token }) {
  const [units, setUnits] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active');

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUnits();
    fetchCompanies();
  }, [token]);

  const fetchUnits = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/units', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUnits(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching units:', err);
        toast.error('ইউনিট তালিকা লোড করতে সমস্যা হয়েছে');
        setLoading(false);
      });
  };

  const fetchCompanies = () => {
    fetch('http://localhost:5000/api/company/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCompanies(data);
          // Auto select first company if available and none selected
          if (data.length > 0 && !companyId) {
            setCompanyId(String(data[0].id));
          }
        }
      })
      .catch(err => {
        console.error('Error fetching companies:', err);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      toast.error('দয়া করে ইউনিটের নাম লিখুন!');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      code: code ? code.trim() : '',
      company_id: companyId ? parseInt(companyId) : null,
      address: address ? address.trim() : '',
      phone: phone ? phone.trim() : '',
      status
    };

    if (editingId !== null) {
      // Update existing unit
      fetch(`http://localhost:5000/api/units/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update unit');
          return data;
        })
        .then(() => {
          toast.success('ইউনিট তথ্য সফলভাবে আপডেট করা হয়েছে!');
          setEditingId(null);
          resetForm();
          fetchUnits();
        })
        .catch(err => toast.error(err.message))
        .finally(() => setSubmitting(false));
    } else {
      // Create new unit
      fetch('http://localhost:5000/api/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save unit');
          return data;
        })
        .then(() => {
          toast.success('নতুন ইউনিট সফলভাবে জমা ও সংরক্ষণ করা হয়েছে!');
          resetForm();
          fetchUnits();
        })
        .catch(err => toast.error(err.message))
        .finally(() => setSubmitting(false));
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setStatus('Active');
    setEditingId(null);
    if (companies.length > 0) {
      setCompanyId(String(companies[0].id));
    } else {
      setCompanyId('');
    }
  };

  const handleEdit = (unit) => {
    setEditingId(unit.id);
    setName(unit.name || '');
    setCode(unit.code || '');
    setCompanyId(unit.company_id ? String(unit.company_id) : (companies[0] ? String(companies[0].id) : ''));
    setAddress(unit.address || '');
    setPhone(unit.phone || '');
    setStatus(unit.status || 'Active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই ইউনিটটি মুছে ফেলতে চান?')) {
      fetch(`http://localhost:5000/api/units/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete unit');
          return data;
        })
        .then(() => {
          toast.success('ইউনিট সফলভাবে মুছে ফেলা হয়েছে!');
          fetchUnits();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  const getStatusBadge = (st) => {
    return st === 'Active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        সক্রিয় (Active)
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        নিষ্ক্রিয় (Inactive)
      </span>
    );
  };

  // Filter units by search query and status
  const filteredUnits = units.filter(unit => {
    const matchesSearch =
      (unit.name && unit.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unit.code && unit.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unit.company?.company_name && unit.company.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unit.address && unit.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unit.phone && unit.phone.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'ALL' || unit.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = units.length;
  const activeCount = units.filter(u => u.status === 'Active').length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Warehouse className="text-sky-400" size={24} />
            <span>ইউনিট সেটিংস (Unit Management)</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            কোম্পানীর অধীনস্থ কারখানা বা বিভিন্ন ইউনিট তৈরি, জমা, আপডেট ও পরিচালনা করুন
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => { fetchUnits(); fetchCompanies(); }}
          className="self-start sm:self-auto flex items-center gap-2 bg-white/5 border border-white/6 hover:bg-white/10 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Mini Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <Warehouse size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">মোট ইউনিট</div>
            <div className="text-lg font-bold text-slate-100">{totalCount} টি</div>
          </div>
        </div>

        <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">সক্রিয় ইউনিট</div>
            <div className="text-lg font-bold text-emerald-400">{activeCount} টি</div>
          </div>
        </div>

        <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <XCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">নিষ্ক্রিয় ইউনিট</div>
            <div className="text-lg font-bold text-rose-400">{inactiveCount} টি</div>
          </div>
        </div>

        <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-xl p-4 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">সংযুক্ত কোম্পানী</div>
            <div className="text-lg font-bold text-slate-100">{companies.length} টি</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Form Card + Right Table Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/6">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              {editingId !== null ? (
                <>
                  <Edit size={18} className="text-amber-400" />
                  <span className="text-amber-400">ইউনিট তথ্য আপডেট করুন</span>
                </>
              ) : (
                <>
                  <PlusCircle size={18} className="text-sky-400" />
                  <span>নতুন ইউনিট জমা / যুক্ত করুন</span>
                </>
              )}
            </h3>
            {editingId !== null && (
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                ID #{editingId}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>আওতাধীন কোম্পানী <span className="text-red-400">*</span></span>
                {companies.length > 0 && (
                  <span className="text-xs text-sky-400 font-normal">কোম্পানী সিলেক্টেড</span>
                )}
              </label>
              <div className="relative">
                <select
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-xl py-2.5 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                >
                  <option value="">-- কোম্পানী নির্বাচন করুন --</option>
                  {companies.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.company_name}
                    </option>
                  ))}
                </select>
              </div>
              {companies.length === 0 && (
                <span className="text-xs text-amber-400 mt-1 block">
                  * আগে কোম্পানী প্রোফাইল থেকে কোম্পানী সেট করুন
                </span>
              )}
            </div>

            {/* Unit Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                ইউনিটের নাম <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-xl py-2.5 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: Unit - 01 (Sweaters) বা Knitting Unit"
                required
              />
            </div>

            {/* Unit Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                ইউনিট কোড (Code)
              </label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-xl py-2.5 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="যেমন: U-01 / BW-01"
              />
            </div>

            {/* Contact / Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                যোগাযোগ / ফোন নম্বর
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-xl py-2.5 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: +880 1711-000000"
                />
              </div>
            </div>

            {/* Location / Address */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                ইউনিটের ঠিকানা / অবস্থান
              </label>
              <textarea
                rows={2}
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-xl py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="যেমন: জরুন, কাশেম কটন মিল, কোনাবাড়ী, গাজীপুর"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                অবস্থা (Status)
              </label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-xl py-2.5 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active (সক্রিয়)</option>
                <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer text-sm ${
                  editingId !== null
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-amber-500/20'
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20'
                }`}
              >
                {editingId !== null ? (
                  <>
                    <Save size={16} />
                    <span>আপডেট সম্পন্ন করুন</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    <span>জমা দিন (Save Unit)</span>
                  </>
                )}
              </button>

              {editingId !== null ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-white/5 border border-white/6 hover:bg-white/10 text-slate-300 font-medium py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-sm"
                >
                  <XCircle size={16} />
                  <span>বাতিল</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white/5 border border-white/6 hover:bg-white/10 text-slate-400 hover:text-slate-200 font-medium py-2.5 px-3 rounded-xl transition-colors cursor-pointer text-xs"
                >
                  রিসেট
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Table Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-4 shadow-xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ইউনিটের নাম, কোড, ঠিকানা দিয়ে অনুসন্ধান করুন..."
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-xl pl-9 pr-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0b0f19]/50 border border-white/6 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="Active">শুধুমাত্র সক্রিয়</option>
                <option value="Inactive">শুধুমাত্র নিষ্ক্রিয়</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-3 text-slate-300 font-semibold w-12 text-center text-xs">#</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-xs">ইউনিটের নাম ও কোড</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-xs">কোম্পানী</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-xs">অবস্থান ও যোগাযোগ</th>
                    <th className="py-3 px-3 text-slate-300 font-semibold text-center text-xs">অবস্থা</th>
                    <th className="py-3 px-3 text-slate-300 font-semibold text-center text-xs w-24">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw size={20} className="animate-spin text-sky-400" />
                          <span>ইউনিটের তথ্য লোড হচ্ছে...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Warehouse size={32} className="text-slate-600" />
                          <span>কোনো ইউনিট পাওয়া যায়নি</span>
                          {searchTerm && (
                            <button
                              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                              className="text-xs text-sky-400 hover:underline mt-1"
                            >
                              ফিল্টার ক্লিয়ার করুন
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((unit, index) => (
                      <tr
                        key={unit.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          editingId === unit.id ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-slate-400 text-center font-mono text-xs">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            <span>{unit.name}</span>
                          </div>
                          {unit.code && (
                            <span className="inline-block mt-0.5 text-xs text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                              {unit.code}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200 text-xs font-medium flex items-center gap-1.5">
                            <Building2 size={13} className="text-indigo-400 shrink-0" />
                            <span>{unit.company?.company_name || 'কোম্পানী নির্দিষ্ট নেই'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {unit.address ? (
                            <div className="text-slate-300 text-xs flex items-start gap-1">
                              <MapPin size={12} className="text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate max-w-[180px]" title={unit.address}>
                                {unit.address}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">-</span>
                          )}
                          {unit.phone && (
                            <div className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                              <Phone size={11} className="text-slate-500" />
                              <span>{unit.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(unit.status)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleEdit(unit)}
                              title="সংশোধন / আপডেট করুন"
                              className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 border border-sky-500/20 transition-colors cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(unit.id)}
                              title="মুছে ফেলুন"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
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

            {/* Footer */}
            {filteredUnits.length > 0 && (
              <div className="py-3 px-4 border-t border-white/6 bg-[#131b2e]/60 flex items-center justify-between text-xs text-slate-400">
                <span>মোট প্রদর্শিত: {filteredUnits.length} টি</span>
                {editingId && (
                  <span className="text-amber-400 font-medium">
                    সংশোধন মোডে আছেন - ফর্ম থেকে পরিবর্তন করে আপডেট করুন
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


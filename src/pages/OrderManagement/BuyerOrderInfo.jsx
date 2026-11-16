import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Edit, Trash2, XCircle, PlusCircle, RefreshCw, X, Search, ChevronDown, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  const filteredOptions = options.filter((opt) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const labelMatch = opt.label && String(opt.label).toLowerCase().includes(term);
    const subMatch = opt.sublabel && String(opt.sublabel).toLowerCase().includes(term);
    return labelMatch || subMatch;
  });

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 pr-8 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
          placeholder={placeholder}
          value={isOpen ? searchTerm : (selectedOption ? selectedOption.label : '')}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          required={required && !value}
        />
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 transition-colors p-0.5 rounded-full cursor-pointer"
            title="রিসেট করুন"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[9999] left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl py-1 divide-y divide-white/5">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = String(opt.id) === String(value);
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-sky-500/20 hover:text-sky-200 transition-colors flex items-center justify-between ${isSelected ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-200'
                    }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="text-[10px] text-slate-400 ml-2 shrink-0">{opt.sublabel}</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-3 text-xs text-slate-500 text-center">
              কোনো ফলাফল পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BuyerOrderInfo({ token }) {
  const [orders, setOrders] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields (Section and Process removed as requested)
  const [buyerId, setBuyerId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  // Table Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Modals state
  const [showIncreaseModal, setShowIncreaseModal] = useState(false);
  const [showRewindingModal, setShowRewindingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [increaseQtyInput, setIncreaseQtyInput] = useState('');
  const [rewindingQtyInput, setRewindingQtyInput] = useState('');
  const [rewindingConfirmed, setRewindingConfirmed] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchBuyers();
    fetchStyles();
  }, []);

  const fetchBuyers = () => {
    fetch('http://localhost:5000/api/buyers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBuyers(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching buyers:', err));
  };

  const fetchStyles = () => {
    fetch('http://localhost:5000/api/styles', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStyles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching styles:', err));
  };

  const fetchOrders = (search = '') => {
    setLoading(true);
    let url = 'http://localhost:5000/api/buyer-orders';
    if (search && search.trim() !== '') {
      url += `?search=${encodeURIComponent(search.trim())}`;
    } else {
      url += '?limit=50';
    }

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setActiveSearch(q);
    fetchOrders(q);
    if (q) {
      toast.success(`"${q}" এর ফলাফল সরাসরি ডাটাবেজ থেকে ফেচ করা হয়েছে!`);
    } else {
      toast.success('ডাটাবেজ থেকে সর্বশেষ ৫০ টি রেকর্ড লোড করা হয়েছে!');
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    fetchOrders('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!buyerId || !styleId || !orderQuantity) {
      const errMsg = 'দয়া করে বায়ার, স্টাইল ও অর্ডার কোয়ান্টিটি পূরণ করুন!';
      setFormError(errMsg);
      toast.error(errMsg);
      return;
    }

    const bId = parseInt(buyerId);
    const stId = parseInt(styleId);

    // Front-end duplicate check for buyer + style
    const isDup = orders.some(item =>
      String(item.buyer_id) === String(bId) &&
      String(item.style_id) === String(stId) &&
      (editingId === null || String(item.id) !== String(editingId))
    );

    if (isDup) {
      const dupMsg = 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই বায়ার এবং স্টাইলের জন্য ইতোমধ্যে একটি বায়ার অর্ডার এন্ট্রি বিদ্যমান রয়েছে।';
      setFormError(dupMsg);
      toast.error(dupMsg);
      return;
    }

    const payload = {
      buyer_id: bId,
      style_id: stId,
      order_quantity: parseInt(orderQuantity)
    };

    if (editingId !== null) {
      fetch(`http://localhost:5000/api/buyer-orders/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update buyer order');
          return data;
        })
        .then(() => {
          toast.success('বায়ার অর্ডার সফলভাবে হালনাগাদ করা হয়েছে!');
          setEditingId(null);
          resetForm();
          setFormError('');
          fetchOrders();
        })
        .catch(err => {
          setFormError(err.message);
          toast.error(err.message);
        });
    } else {
      fetch('http://localhost:5000/api/buyer-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save buyer order');
          return data;
        })
        .then(() => {
          toast.success('নতুন বায়ার অর্ডার সফলভাবে তৈরি করা হয়েছে!');
          resetForm();
          setFormError('');
          fetchOrders();
        })
        .catch(err => {
          setFormError(err.message);
          toast.error(err.message);
        });
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormError('');
    setBuyerId(item.buyer_id);
    setStyleId(item.style_id);
    setOrderQuantity(item.order_quantity);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormError('');
    resetForm();
  };

  const handleDelete = (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই বায়ার অর্ডার রেকর্ডটি মুছে ফেলতে চান?')) return;

    fetch(`http://localhost:5000/api/buyer-orders/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete order');
        return data;
      })
      .then(() => {
        toast.success('বায়ার অর্ডার সফলভাবে মুছে ফেলা হয়েছে!');
        fetchOrders();
      })
      .catch(err => toast.error(err.message));
  };

  const resetForm = () => {
    setBuyerId('');
    setStyleId('');
    setOrderQuantity('');
  };

  // Options formatting for SearchableSelect Style
  const styleOptions = (
    buyerId
      ? styles?.filter((st) => String(st.buyer_id) === String(buyerId))
      : styles
  )?.map((st) => ({
    id: st.id,
    label: st.style_no,
    sublabel: st.buyer_name ? `(${st.buyer_name})` : ''
  })) || [];

  // Order Increase Handlers
  const handleOpenIncreaseModal = (item) => {
    setSelectedOrder(item);
    setIncreaseQtyInput(item.order_quantity !== undefined && item.order_quantity !== null ? String(item.order_quantity) : '');
    setShowIncreaseModal(true);
  };

  const handleSaveIncreaseRequest = (e) => {
    e.preventDefault();
    if (!increaseQtyInput || parseInt(increaseQtyInput) <= 0) {
      toast.error('দয়া করে সঠিক বৃদ্ধি করার কোয়ান্টিটি প্রদান করুন!');
      return;
    }

    fetch('http://localhost:5000/api/approvals/order-increase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        buyer_order_id: selectedOrder.id,
        increase_quantity: parseInt(increaseQtyInput)
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to submit order increase request');
        return data;
      })
      .then(data => {
        toast.success(data.message || 'অর্ডার বৃদ্ধির আবেদন জমা দেওয়া হয়েছে!');
        setShowIncreaseModal(false);
        setIncreaseQtyInput('');
        setSelectedOrder(null);
      })
      .catch(err => toast.error(err.message));
  };

  // Re-Winding Handlers
  const handleOpenRewindingModal = (item) => {
    setSelectedOrder(item);
    setRewindingQtyInput(item.order_quantity !== undefined && item.order_quantity !== null ? String(item.order_quantity) : '');
    setRewindingConfirmed(true);
    setShowRewindingModal(true);
  };

  const handleSaveRewindingRequest = (e) => {
    e.preventDefault();
    if (!rewindingConfirmed) {
      toast.error('আবেদন পাঠানোর পূর্বে চেকবক্স নিশ্চিত করুন!');
      return;
    }
    if (!rewindingQtyInput || parseInt(rewindingQtyInput) <= 0) {
      toast.error('দয়া করে সঠিক রি-ওয়াইন্ডিং কোয়ান্টিটি প্রদান করুন!');
      return;
    }

    fetch('http://localhost:5000/api/approvals/rewinding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        buyer_order_id: selectedOrder.id,
        rewinding_quantity: parseInt(rewindingQtyInput),
        is_confirmed: rewindingConfirmed
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to submit rewinding request');
        return data;
      })
      .then(data => {
        toast.success(data.message || 'রি-ওয়াইন্ডিং আবেদন সেভ ও পেন্ডিং এ পাঠানো হয়েছে!');
        setShowRewindingModal(false);
        setRewindingQtyInput('');
        setSelectedOrder(null);
      })
      .catch(err => toast.error(err.message));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <ShoppingBag size={18} className="text-sky-400" />
            {editingId !== null ? 'বায়ার অর্ডার সম্পাদনা করুন' : 'নতুন বায়ার অর্ডার তৈরি করুন'}
          </h3>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">বায়ার *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={buyerId}
                onChange={(e) => {
                  const selectedBuyerId = e.target.value;
                  setBuyerId(selectedBuyerId);
                  if (selectedBuyerId && styleId) {
                    const currentStyle = styles.find(st => String(st.id) === String(styleId));
                    if (currentStyle && String(currentStyle.buyer_id) !== String(selectedBuyerId)) {
                      setStyleId('');
                    }
                  }
                }}
                required
              >
                <option value="">-- সিলেক্ট করুন --</option>
                {buyers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">স্টাইল *</label>
              <SearchableSelect
                options={styleOptions}
                value={styleId}
                onChange={(selectedId) => {
                  setStyleId(selectedId);
                  if (selectedId && !buyerId) {
                    const currentStyle = styles.find(st => String(st.id) === String(selectedId));
                    if (currentStyle && currentStyle.buyer_id) {
                      setBuyerId(currentStyle.buyer_id);
                    }
                  }
                }}
                placeholder="-- সিলেক্ট করুন --"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">অর্ডার কোয়ান্টিটি (Pcs) *</label>
              <input
                type="number"
                min="1"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors font-bold"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm"
              >
                {editingId !== null ? 'হালনাগাদ (Update)' : 'অর্ডার সংরক্ষণ করুন'}
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

        {/* Table Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18223c]/75 backdrop-blur-md p-3.5 px-4 border border-white/6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-100 whitespace-nowrap">বায়ার অর্ডার তালিকা</h3>
              <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium">
                {activeSearch ? `ডাটাবেজ ফলাফল: ${orders.length} টি` : `সর্বশেষ ৫০ টি রেকর্ড`}
              </span>
            </div>

            {/* Direct Database Search Option with Search Button */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-1.5 pl-9 pr-8 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-500"
                  placeholder="বায়ার, স্টাইল নম্বর দিয়ে সার্চ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                    title="সার্চ রিসেট করুন"
                  >
                    <XCircle size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md shadow-sky-500/20"
              >
                <Search size={14} />
                <span>সার্চ</span>
              </button>
            </form>
          </div>

          {loading ? (
            <div className="text-slate-400 p-4">ডাটাবেজ থেকে লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">বায়ার</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">স্টাইল নম্বর</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">অর্ডার কোয়ান্টিটি</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold text-emerald-400">ইয়ার্ন রিসিভড</th>
                    <th className="py-3.5 px-4 text-sky-400 font-semibold text-center">অর্ডার বৃদ্ধি</th>
                    <th className="py-3.5 px-4 text-amber-400 font-semibold text-center">রি-উইন্ডিং</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-slate-400 space-y-2">
                        <div>কোন বায়ার অর্ডার খুঁজে পাওয়া যায়নি</div>
                        {activeSearch && (
                          <button
                            type="button"
                            onClick={handleResetSearch}
                            className="text-xs text-sky-400 hover:underline cursor-pointer font-medium"
                          >
                            সার্চ রিসেট করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    orders.map((item, index) => (
                      <tr key={item.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-semibold">{item.buyer_name || '—'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                            {item.style_no || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-100 font-bold">{Number(item.order_quantity).toLocaleString()} pcs</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">
                          {Number(item.yarn_received || 0).toLocaleString()} pcs
                        </td>

                        {/* Order Increase Column */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenIncreaseModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-semibold transition-colors cursor-pointer"
                            title="অর্ডার কোয়ান্টিটি বৃদ্ধি করার আবেদন জানান"
                          >
                            <PlusCircle size={13} />
                            <span>বৃদ্ধি</span>
                          </button>
                        </td>

                        {/* Re-Winding Column */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenRewindingModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold transition-colors cursor-pointer"
                            title="রি-ওয়াইন্ডিং আবেদন জানান"
                          >
                            <RefreshCw size={13} />
                            <span>রি-উইন্ডিং</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 rounded-lg transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={16} />
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

      {/* --- Order Increase Modal --- */}
      {showIncreaseModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18223c] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/6 pb-3">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle size={18} className="text-sky-400" />
                অর্ডার বৃদ্ধি করুন (Order ID: #{selectedOrder.id})
              </h4>
              <button
                onClick={() => setShowIncreaseModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#0b0f19]/60 p-3.5 rounded-xl border border-white/5 space-y-1.5 text-xs text-slate-300">
              <div><strong>বায়ার:</strong> {selectedOrder.buyer_name}</div>
              <div><strong>স্টাইল:</strong> {selectedOrder.style_no}</div>
              {selectedOrder.process_name && (
                <div><strong>প্রসেস:</strong> {selectedOrder.process_name}</div>
              )}
              <div><strong>বর্তমান মোট অর্ডার কোয়ান্টিটি:</strong> <span className="text-sky-400 font-bold">{Number(selectedOrder.order_quantity).toLocaleString()} pcs</span></div>
            </div>

            <form onSubmit={handleSaveIncreaseRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">বৃদ্ধি করার জন্য নতুন কোয়ান্টিটি (Pcs) *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2.5 text-slate-100 text-sm font-bold focus:outline-none focus:border-sky-500 transition-colors"
                  value={increaseQtyInput}
                  onChange={(e) => setIncreaseQtyInput(e.target.value)}
                  placeholder="উদা. 500"
                  required
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-lg">
                ⚠️ নোট: আপনার নতুন যুক্ত করা কোয়ান্টিটি পেন্ডিং টেবিলে জমা হবে। এডমিন কর্তৃক অনুমোদনের (Approval) পরেই মূল অর্ডারের সাথে তা যোগ হবে।
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors cursor-pointer text-sm"
                >
                  আবেদন জমা দিন (Pending Approval)
                </button>
                <button
                  type="button"
                  onClick={() => setShowIncreaseModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Re-Winding Modal --- */}
      {showRewindingModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18223c] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/6 pb-3">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <RefreshCw size={18} className="text-amber-400" />
                রি-ওয়াইন্ডিং এন্ট্রি (Order ID: #{selectedOrder.id})
              </h4>
              <button
                onClick={() => setShowRewindingModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#0b0f19]/60 p-3.5 rounded-xl border border-white/5 space-y-1.5 text-xs text-slate-300">
              <div><strong>বায়ার:</strong> {selectedOrder.buyer_name}</div>
              <div><strong>স্টাইল:</strong> {selectedOrder.style_no}</div>
              {selectedOrder.process_name && (
                <div><strong>প্রসেস:</strong> {selectedOrder.process_name}</div>
              )}
              <div><strong>বর্তমান মূল কোয়ান্টিটি:</strong> <span className="text-amber-400 font-bold">{Number(selectedOrder.order_quantity).toLocaleString()} pcs</span></div>
            </div>

            <form onSubmit={handleSaveRewindingRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">রি-ওয়াইন্ডিং কোয়ান্টিটি (Pcs) *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-[#0b0f19] border border-white/10 rounded-lg p-2.5 text-slate-100 text-sm font-bold focus:outline-none focus:border-amber-500 transition-colors"
                  value={rewindingQtyInput}
                  onChange={(e) => setRewindingQtyInput(e.target.value)}
                  placeholder="উদা. 200"
                  required
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="confirmRewindingCheck"
                  checked={rewindingConfirmed}
                  onChange={(e) => setRewindingConfirmed(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded bg-[#0b0f19] border-white/20 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="confirmRewindingCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                  রি-ওয়াইন্ডিং কোয়ান্টিটি যোগ করার জন্য আবেদন পাঠাতে সম্মত
                </label>
              </div>

              <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs rounded-lg">
                ℹ️ সাময়িকভাবে এটি রি-ওয়াইন্ডিং টেবিলে সেভ থাকবে। এডমিন এপ্রুভ করার সাথে সাথে মূল অর্ডারের সাথে যুক্ত হয়ে যাবে।
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg shadow-amber-500/10 transition-colors cursor-pointer text-sm"
                >
                  আবেদন জমা দিন (Pending Approval)
                </button>
                <button
                  type="button"
                  onClick={() => setShowRewindingModal(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-sm"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

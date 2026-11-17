import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DollarSign, Edit, Trash2, XCircle, Search, AlertCircle, ChevronDown, X, Calendar, RotateCcw, Zap, CheckCircle, Loader2, Sparkles, Building2, Layers, Check } from 'lucide-react';
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

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentMonthString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const getItemMonthYear = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const formatMonthDisplay = (monthYearStr) => {
  if (!monthYearStr) return '';
  const [year, month] = monthYearStr.split('-');
  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const mIdx = parseInt(month, 10) - 1;
  return `${monthNamesBn[mIdx] || month} ${year}`;
};

export default function PieceRate({ token }) {
  const [rates, setRates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [styles, setStyles] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Form Fields (left sidebar)
  const [sectionId, setSectionId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [processId, setProcessId] = useState('');
  const [rate, setRate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(getTodayDateString());

  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  // Table Inline Editing States
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [inlineRate, setInlineRate] = useState('');
  const [inlineDate, setInlineDate] = useState('');
  const [inlineSaving, setInlineSaving] = useState(false);

  // Current running month helper
  const currentRunningMonth = getCurrentMonthString();

  // Table Filter States: Date filter (Start Date & End Date), Section, Style, Process, Search
  const [filterStartDate, setFilterStartDate] = useState(getTodayDateString());
  const [filterEndDate, setFilterEndDate] = useState(getTodayDateString());
  const [filterSection, setFilterSection] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [filterProcess, setFilterProcess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Production Rate Process States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkDepartmentId, setBulkDepartmentId] = useState('');
  const [bulkSectionId, setBulkSectionId] = useState('');
  const [bulkStartDate, setBulkStartDate] = useState(`${currentRunningMonth}-01`);
  const [bulkEndDate, setBulkEndDate] = useState(getTodayDateString());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  // Filter sections by department dynamically for the bulk modal
  const bulkFilteredSections = useMemo(() => {
    if (!bulkDepartmentId) return sections;
    return sections.filter(s => String(s.department_id) === String(bulkDepartmentId));
  }, [sections, bulkDepartmentId]);

  const handleOpenBulkModal = () => {
    setBulkStartDate(`${currentRunningMonth}-01`);
    setBulkEndDate(getTodayDateString());
    setBulkDepartmentId('');
    setBulkSectionId(filterSection || '');
    setBulkResult(null);
    setIsBulkModalOpen(true);
  };

  const handleBulkProcess = async (e) => {
    e.preventDefault();
    if (!bulkStartDate || !bulkEndDate) {
      toast.error('দয়া করে শুরুর তারিখ এবং শেষ তারিখ প্রদান করুন!');
      return;
    }

    if (bulkStartDate > bulkEndDate) {
      toast.error('শুরুর তারিখ শেষ তারিখের চেয়ে বড় হতে পারে না!');
      return;
    }

    setBulkProcessing(true);
    setBulkResult(null);

    try {
      const res = await fetch('http://localhost:5000/api/piece-rates/bulk-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          department_id: bulkDepartmentId || null,
          section_id: bulkSectionId || null,
          start_date: bulkStartDate,
          end_date: bulkEndDate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'বাল্ক প্রসেসিংয়ে সমস্যা হয়েছে!');
      }

      setBulkResult(data);
      toast.success(data.message || 'বাল্ক প্রোডাকশন রেট সফলভাবে প্রসেস হয়েছে!', { duration: 5000 });

      // Automatically set date filter to target date range and reload rates
      setFilterStartDate(bulkStartDate);
      setFilterEndDate(bulkEndDate);
      setHasSearched(true);
      fetchRates(bulkStartDate, bulkEndDate, filterSection, filterStyle, filterProcess, searchQuery);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Processes filtered for the filter bar (optionally scoped by selected section/style in filter)
  const tableProcessOptions = useMemo(() => {
    return processes.filter(p => {
      if (filterSection && p.section_id !== parseInt(filterSection)) return false;
      if (filterStyle && p.style_id !== parseInt(filterStyle)) return false;
      return true;
    });
  }, [processes, filterSection, filterStyle]);

  // Fetch rates directly from backend database with all active filters
  const fetchRates = (
    startDateVal = filterStartDate,
    endDateVal = filterEndDate,
    secVal = filterSection,
    styleVal = filterStyle,
    procVal = filterProcess,
    searchVal = searchQuery
  ) => {
    setLoading(true);
    setHasSearched(true);
    const params = new URLSearchParams();

    if (startDateVal && startDateVal.trim() !== '' && endDateVal && endDateVal.trim() !== '') {
      params.append('start_date', startDateVal.trim());
      params.append('end_date', endDateVal.trim());
    } else if (startDateVal && startDateVal.trim() !== '') {
      params.append('date', startDateVal.trim());
    } else if (endDateVal && endDateVal.trim() !== '') {
      params.append('end_date', endDateVal.trim());
    }

    if (secVal && secVal !== '') params.append('section_id', secVal);
    if (styleVal && styleVal !== '') params.append('style_id', styleVal);
    if (procVal && procVal !== '') params.append('process_id', procVal);
    if (searchVal && searchVal.trim() !== '') params.append('search', searchVal.trim());

    const qs = params.toString();
    const url = `http://localhost:5000/api/piece-rates${qs ? `?${qs}` : ''}`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rates:', err);
        setLoading(false);
      });
  };

  const fetchDepartments = () => {
    fetch('http://localhost:5000/api/departments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    })
      .then(res => res.json())
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching departments:', err));
  };

  const fetchSections = () => {
    fetch('http://localhost:5000/api/sections', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    })
      .then(res => res.json())
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching sections:', err));
  };

  const fetchStyles = () => {
    fetch('http://localhost:5000/api/styles', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    })
      .then(res => res.json())
      .then(data => setStyles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching styles:', err));
  };

  const fetchProcesses = () => {
    fetch('http://localhost:5000/api/processes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    })
      .then(res => res.json())
      .then(data => setProcesses(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching processes:', err));
  };

  useEffect(() => {
    // Default data load is stopped per requirement: rates will only load upon explicit search
    fetchDepartments();
    fetchSections();
    fetchStyles();
    fetchProcesses();

    const handleUnitChange = () => {
      fetchDepartments();
      fetchSections();
      fetchStyles();
      fetchProcesses();
      if (hasSearched) {
        fetchRates();
      }
    };
    window.addEventListener('unit-changed', handleUnitChange);
    return () => window.removeEventListener('unit-changed', handleUnitChange);
  }, [token, hasSearched, filterStartDate, filterEndDate, filterSection, filterStyle, filterProcess, searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchRates(filterStartDate, filterEndDate, filterSection, filterStyle, filterProcess, searchQuery);
    toast.success('ডাটাবেজ থেকে ডাটা খোঁজা হচ্ছে...', { id: 'rate-search' });
  };

  const handleResetAllFilters = () => {
    setFilterStartDate(getTodayDateString());
    setFilterEndDate(getTodayDateString());
    setFilterSection('');
    setFilterStyle('');
    setFilterProcess('');
    setSearchQuery('');
    setRates([]);
    setHasSearched(false);
    setInlineEditingId(null);
    toast.success('ফিল্টার রিসেট করা হয়েছে!');
  };

  // Inline Table Edit Handlers
  const startInlineEdit = (item) => {
    setInlineEditingId(item.id);
    setInlineRate(item.rate !== undefined && item.rate !== null ? item.rate.toString() : '');
    if (item.effective_date) {
      const dbDate = new Date(item.effective_date);
      const year = dbDate.getFullYear();
      const month = String(dbDate.getMonth() + 1).padStart(2, '0');
      const day = String(dbDate.getDate()).padStart(2, '0');
      setInlineDate(`${year}-${month}-${day}`);
    } else {
      setInlineDate(getTodayDateString());
    }
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlineRate('');
    setInlineDate('');
  };

  const handleInlineSave = async (item) => {
    if (inlineRate === '' || isNaN(parseFloat(inlineRate)) || parseFloat(inlineRate) < 0) {
      toast.error('দয়া করে সঠিক রেট প্রদান করুন!');
      return;
    }

    setInlineSaving(true);
    try {
      const payload = {
        section_id: item.section_id,
        style_id: item.style_id,
        process_id: item.process_id,
        color_id: item.color_id || null,
        rate: parseFloat(inlineRate),
        effective_date: inlineDate || item.effective_date
      };

      const res = await fetch(`http://localhost:5000/api/piece-rates/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'পিস রেট আপডেট করতে সমস্যা হয়েছে!');
      }

      toast.success('পিস রেট সফলভাবে আপডেট করা হয়েছে!');

      // Update rate directly in state array so the table updates immediately
      setRates(prevRates => prevRates.map(r => {
        if (r.id === item.id) {
          return {
            ...r,
            rate: parseFloat(inlineRate),
            effective_date: inlineDate ? new Date(inlineDate).toISOString() : r.effective_date
          };
        }
        return r;
      }));

      setInlineEditingId(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setInlineSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!sectionId || !styleId || !processId || !rate || !effectiveDate) {
      const errMsg = 'অনুগ্রহ করে সকল বাধ্যতাবোধক ঘর (Required fields) পূরণ করুন!';
      setFormError(errMsg);
      toast.error(errMsg);
      return;
    }

    const sId = parseInt(sectionId);
    const stId = parseInt(styleId);
    const pId = parseInt(processId);

    // Front-end duplicate check
    const isDup = rates.some(item =>
      item.section_id === sId &&
      item.style_id === stId &&
      item.process_id === pId &&
      (editingId === null || item.id !== editingId)
    );

    if (isDup) {
      const dupMsg = 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, স্টাইল এবং প্রসেসের জন্য ইতোমধ্যে একটি পিস রেট এন্ট্রি বিদ্যমান রয়েছে।';
      setFormError(dupMsg);
      toast.error(dupMsg);
      return;
    }

    const payload = {
      section_id: sId,
      style_id: stId,
      process_id: pId,
      rate: parseFloat(rate),
      effective_date: effectiveDate
    };

    try {
      if (editingId !== null) {
        const res = await fetch(`http://localhost:5000/api/piece-rates/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update piece rate');

        toast.success('পিস রেট সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
      } else {
        const res = await fetch('http://localhost:5000/api/piece-rates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save piece rate');

        toast.success('নতুন পিস রেট সফলভাবে যুক্ত করা হয়েছে!');
      }

      setSectionId('');
      setStyleId('');
      setProcessId('');
      setRate('');
      setEffectiveDate(getTodayDateString());
      setFormError('');
      fetchRates();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormError('');
    setSectionId(item.section_id || '');
    setStyleId(item.style_id || '');
    setProcessId(item.process_id || '');
    setRate(item.rate ? item.rate.toString() : '');

    if (item.effective_date) {
      const dbDate = new Date(item.effective_date);
      const year = dbDate.getFullYear();
      const month = String(dbDate.getMonth() + 1).padStart(2, '0');
      const day = String(dbDate.getDate()).padStart(2, '0');
      setEffectiveDate(`${year}-${month}-${day}`);
    } else {
      setEffectiveDate(getTodayDateString());
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormError('');
    setSectionId('');
    setStyleId('');
    setProcessId('');
    setRate('');
    setEffectiveDate(getTodayDateString());
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই রেটটি ডিলিট করতে চান?')) {
      fetch(`http://localhost:5000/api/piece-rates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete rate');
          return data;
        })
        .then(() => {
          toast.success('পিস রেট সফলভাবে ডিলিট করা হয়েছে!');
          fetchRates();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  // Options formatting for SearchableSelect
  const styleOptions = styles?.map((st) => ({
    id: st.id,
    label: st.style_no,
    sublabel: st.buyer_name ? `(${st.buyer_name})` : ''
  })) || [];

  // Section + Style wise process load (dynamic with editing fallback)
  const formFilteredProcesses = useMemo(() => {
    if (!sectionId) return [];

    const secIdNum = parseInt(sectionId);
    const styleIdNum = styleId ? parseInt(styleId) : null;
    const procIdNum = processId ? parseInt(processId) : null;

    // 1. First priority: Exact match of section and style
    const exactMatches = processes.filter(
      p => p.section_id === secIdNum && (!styleIdNum || p.style_id === styleIdNum)
    );

    // 2. Fallback: If no exact matches for this style, load all processes under this section
    let list = exactMatches.length > 0
      ? exactMatches
      : processes.filter(p => p.section_id === secIdNum);

    // 3. Guarantee that the active/editing processId is always present in the options list
    if (procIdNum) {
      const currentProc = processes.find(p => p.id === procIdNum);
      if (currentProc && !list.some(p => p.id === currentProc.id)) {
        list = [currentProc, ...list];
      }
    }

    // Deduplicate processes by unique ID
    const uniqueMap = new Map();
    list.forEach(p => uniqueMap.set(p.id, p));
    return Array.from(uniqueMap.values());
  }, [processes, sectionId, styleId, processId]);

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Piece Rate Entry Form */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <DollarSign size={18} className="text-sky-400" />
            {editingId !== null ? 'পিস রেট সংশোধন করুন' : 'পিস রেট সেট করুন'}
          </h3>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">সেকশন (Section) *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={sectionId}
                onChange={(e) => {
                  setSectionId(e.target.value);
                  setProcessId('');
                }}
                required
              >
                <option value="">Select Section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">স্টাইল নম্বর *</label>
              <SearchableSelect
                options={styleOptions}
                value={styleId}
                onChange={(selectedId) => {
                  setStyleId(selectedId);
                  setProcessId('');
                }}
                placeholder="Select Style..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">প্রসেস *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={processId}
                onChange={(e) => setProcessId(e.target.value)}
                required
                disabled={!sectionId}
              >
                <option value="">
                  {!sectionId
                    ? "First select a section"
                    : formFilteredProcesses.length === 0
                      ? "No processes found for this section"
                      : "Select Process"}
                </option>
                {formFilteredProcesses.map((p) => (
                  <option key={p.id} value={p.id}>{p.process_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">রেট (টাকা / পিস) *</label>
              <input
                type="number"
                step="0.01"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="45.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">কার্যকর তারিখ (Effective Date) *</label>
              <input
                type="date"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'রেট সংরক্ষণ করুন'}
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

        {/* Piece Rate Table List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#18223c]/75 backdrop-blur-md p-4 border border-white/6 rounded-2xl shadow-xl space-y-3.5">
            {/* Table Header: Title + Count Badge + Quick Switchers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-100 whitespace-nowrap">পিস রেট তালিকা</h3>
                <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium">
                  {!hasSearched
                    ? 'ডাটা সার্চ পেন্ডিং'
                    : filterStartDate && filterEndDate
                      ? (filterStartDate === filterEndDate
                          ? `তারিখ (${filterStartDate}): ${rates.length} টি`
                          : `তারিখ (${filterStartDate} হতে ${filterEndDate}): ${rates.length} টি`)
                      : filterStartDate
                        ? `তারিখ (${filterStartDate}): ${rates.length} টি`
                        : `মোট প্রাপ্ত ডাটা: ${rates.length} টি`}
                </span>
                {/* Quick Date Presets */}
                <button
                  type="button"
                  onClick={() => {
                    const today = getTodayDateString();
                    setFilterStartDate(today);
                    setFilterEndDate(today);
                    fetchRates(today, today, filterSection, filterStyle, filterProcess, searchQuery);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1"
                  title="আজকের তারিখের পিস রেট দেখুন"
                >
                  ⚡ আজকের তারিখ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const start = `${currentRunningMonth}-01`;
                    const end = getTodayDateString();
                    setFilterStartDate(start);
                    setFilterEndDate(end);
                    fetchRates(start, end, filterSection, filterStyle, filterProcess, searchQuery);
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1"
                  title="চলতি মাসের পিস রেট দেখুন"
                >
                  📅 চলতি মাস
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Bulk Production Rate Process Button */}
                <button
                  type="button"
                  onClick={handleOpenBulkModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  title="প্রোডাকশন টেবিল থেকে বাল্ক রেট প্রসেস করুন"
                >
                  <Sparkles size={13} className="text-amber-300" />
                  <span>বাল্ক প্রোডাকশন রেট</span>
                </button>

                {/* Reset All Filters button */}
                {(filterSection || filterStyle || filterProcess || searchQuery || filterStartDate || filterEndDate || hasSearched) && (
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer transition-colors font-medium bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-xl border border-rose-500/20"
                    title="সকল ফিল্টার রিসেট করুন"
                  >
                    <RotateCcw size={13} />
                    <span>ফিল্টার রিসেট</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls: Date Filter (Start Date -> End Date) -> Section -> Style -> Process -> Search Box -> Search Button */}
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
              {/* 1. Start Date (শুরুর তারিখ) */}
              <div className="relative flex items-center bg-[#0b0f19]/70 border border-white/10 rounded-xl px-2.5 py-1 text-xs shrink-0 hover:border-sky-500/50 transition-all group">
                <Calendar size={13} className="text-sky-400 shrink-0 mr-1.5 group-hover:text-sky-300 transition-colors" />
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  title="শুরুর তারিখ (Start Date) - শুধুমাত্র এই তারিখের ডাটা খুঁজতে শেষ তারিখ খালি রাখতে পারেন"
                  className="bg-transparent text-slate-100 text-xs focus:outline-none cursor-pointer font-medium w-28 py-0.5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-90 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
                {filterStartDate && (
                  <button
                    type="button"
                    onClick={() => setFilterStartDate('')}
                    className="text-slate-400 hover:text-rose-400 transition-colors p-0.5 ml-1 cursor-pointer"
                    title="শুরুর তারিখ ক্লিয়ার করুন"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 2. End Date (শেষ তারিখ) */}
              <div className="relative flex items-center bg-[#0b0f19]/70 border border-white/10 rounded-xl px-2.5 py-1 text-xs shrink-0 hover:border-sky-500/50 transition-all group">
                <Calendar size={13} className="text-teal-400 shrink-0 mr-1.5 group-hover:text-teal-300 transition-colors" />
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  title="শেষ তারিখ (End Date)"
                  className="bg-transparent text-slate-100 text-xs focus:outline-none cursor-pointer font-medium w-28 py-0.5 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-90 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
                {filterEndDate && (
                  <button
                    type="button"
                    onClick={() => setFilterEndDate('')}
                    className="text-slate-400 hover:text-rose-400 transition-colors p-0.5 ml-1 cursor-pointer"
                    title="শেষ তারিখ ক্লিয়ার করুন"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 3. Section Filter Dropdown */}
              <div className="relative flex items-center bg-[#0b0f19]/70 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs shrink-0 hover:border-sky-500/40 transition-colors">
                <select
                  value={filterSection}
                  onChange={(e) => {
                    setFilterSection(e.target.value);
                    setFilterProcess('');
                  }}
                  className="bg-transparent text-slate-100 text-xs focus:outline-none cursor-pointer font-medium pr-5 appearance-none max-w-[125px] truncate"
                  title="সেকশন ফিল্টার করুন"
                >
                  <option value="" className="bg-[#131b2e] text-slate-300">
                    সকল সেকশন
                  </option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#131b2e] text-slate-100">
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>

              {/* 4. Style Filter Dropdown */}
              <div className="relative flex items-center bg-[#0b0f19]/70 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs shrink-0 hover:border-sky-500/40 transition-colors">
                <select
                  value={filterStyle}
                  onChange={(e) => {
                    setFilterStyle(e.target.value);
                    setFilterProcess('');
                  }}
                  className="bg-transparent text-slate-100 text-xs focus:outline-none cursor-pointer font-medium pr-5 appearance-none max-w-[125px] truncate"
                  title="স্টাইল ফিল্টার করুন"
                >
                  <option value="" className="bg-[#131b2e] text-slate-300">
                    সকল স্টাইল
                  </option>
                  {styles.map((st) => (
                    <option key={st.id} value={st.id} className="bg-[#131b2e] text-slate-100">
                      {st.style_no}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>

              {/* 5. Process Filter Dropdown */}
              <div className="relative flex items-center bg-[#0b0f19]/70 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs shrink-0 hover:border-sky-500/40 transition-colors">
                <select
                  value={filterProcess}
                  onChange={(e) => setFilterProcess(e.target.value)}
                  className="bg-transparent text-slate-100 text-xs focus:outline-none cursor-pointer font-medium pr-5 appearance-none max-w-[130px] truncate"
                  title="প্রসেস ফিল্টার করুন"
                >
                  <option value="" className="bg-[#131b2e] text-slate-300">
                    সকল প্রসেস
                  </option>
                  {tableProcessOptions.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#131b2e] text-slate-100">
                      {p.process_name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>

              {/* 6. Search Text Input Box */}
              <div className="relative flex-1 min-w-[150px]">
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-1.5 pl-8 pr-7 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-500"
                  placeholder="সেকশন, স্টাইল, প্রসেস, রেট..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                    title="সার্চ ক্লিয়ার করুন"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* 7. Search Button (Queries database on click) */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-60 text-white font-semibold py-1.5 px-3.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer text-xs shrink-0"
                title="ডাটাবেজ থেকে ডাটা লোড করুন"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search size={13} />
                )}
                <span>{loading ? 'লোড হচ্ছে...' : 'সার্চ'}</span>
              </button>

              {/* 8. Reset Button */}
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-1.5 px-2.5 rounded-xl transition-all cursor-pointer text-xs shrink-0"
                title="ফিল্টার রিসেট করুন"
              >
                <RotateCcw size={12} />
                <span>রিসেট</span>
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-[#18223c]/50 border border-white/6 rounded-2xl text-slate-400 gap-2.5 shadow-xl">
              <div className="w-7 h-7 border-2 border-sky-400/20 border-t-sky-400 rounded-full animate-spin" />
              <span className="text-xs">ডাটাবেজ থেকে ডাটা লোড করা হচ্ছে...</span>
            </div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">সেকশন</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">স্টাইল নম্বর</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">প্রসেস</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">রেট</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">কার্যকর তারিখ</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {!hasSearched ? (
                    <tr>
                      <td colSpan="7" className="text-center py-14 text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/5">
                            <Search size={22} />
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-slate-200">
                              পিস রেট দেখতে তারিখ বা ফিল্টার নির্বাচন করে সার্চ করুন
                            </div>
                            <div className="text-xs text-slate-500 max-w-md mx-auto">
                              ডিফল্ট ডাটা লোড নিষ্ক্রিয় রাখা হয়েছে। প্রয়োজনীয় তারিখ, সেকশন বা স্টাইল নির্ধারণ করে 'সার্চ' বাটনে ক্লিক করলে ডাটা টেবিলে লোড হবে।
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-sky-500/10"
                          >
                            <Search size={13} />
                            <span>ডাটা সার্চ করুন</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : rates.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400 space-y-2">
                        <div>
                          {filterStartDate
                            ? `নির্বাচিত তারিখে কোনো পিস রেট রেকর্ড পাওয়া যায়নি`
                            : 'কোন পিস রেট রেকর্ড খুঁজে পাওয়া যায়নি'}
                        </div>
                        {(searchQuery || filterSection || filterStyle || filterProcess || filterStartDate || filterEndDate) && (
                          <button
                            type="button"
                            onClick={handleResetAllFilters}
                            className="text-xs text-sky-400 hover:underline cursor-pointer font-medium"
                          >
                            সকল ফিল্টার রিসেট করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    rates.map((item, index) => {
                      const isInlineEditing = inlineEditingId === item.id;
                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isInlineEditing
                              ? 'bg-sky-500/10 border-l-4 border-sky-400'
                              : 'hover:bg-white/2'
                          }`}
                        >
                          <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-200">{item.section_name || '—'}</td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                              {item.style_no || '—'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">{item.process_name || '—'}</td>

                          {/* Rate Column: Inline Editable with Save on Enter */}
                          <td
                            className="py-3.5 px-4 font-bold"
                            onDoubleClick={() => {
                              if (!isInlineEditing) startInlineEdit(item);
                            }}
                            title={!isInlineEditing ? 'ডাবল ক্লিক করে রেট এডিট করুন' : ''}
                          >
                            {isInlineEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={inlineRate}
                                  onChange={(e) => setInlineRate(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleInlineSave(item);
                                    if (e.key === 'Escape') cancelInlineEdit();
                                  }}
                                  autoFocus
                                  className="w-24 bg-[#0b0f19] border border-sky-400 rounded-lg px-2.5 py-1 text-emerald-400 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                                  placeholder="0.00"
                                />
                                <span className="text-xs text-slate-400 font-medium">BDT</span>
                              </div>
                            ) : (
                              <span className="text-emerald-400 font-bold">{Number(item.rate).toFixed(2)} BDT</span>
                            )}
                          </td>

                          {/* Effective Date Column: Inline Editable */}
                          <td className="py-3.5 px-4 text-slate-300">
                            {isInlineEditing ? (
                              <input
                                type="date"
                                value={inlineDate}
                                onChange={(e) => setInlineDate(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className="bg-[#0b0f19] border border-white/20 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-sky-400"
                              />
                            ) : (
                              item.effective_date ? new Date(item.effective_date).toLocaleDateString('en-GB') : '—'
                            )}
                          </td>

                          {/* Actions Column: Save/Cancel when editing, Edit/Delete when idle */}
                          <td className="py-3.5 px-4">
                            {isInlineEditing ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleInlineSave(item)}
                                  disabled={inlineSaving}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                                  title="সংরক্ষণ করুন (Save)"
                                >
                                  {inlineSaving ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <Check size={14} />
                                  )}
                                  <span>সেভ</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelInlineEdit}
                                  disabled={inlineSaving}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition-all cursor-pointer"
                                  title="বাতিল করুন (Cancel)"
                                >
                                  <X size={14} />
                                  <span>বাতিল</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-center">
                                <button
                                  type="button"
                                  onClick={() => startInlineEdit(item)}
                                  className="inline-flex items-center justify-center w-8 h-8 border border-sky-500/20 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors cursor-pointer"
                                  title="টেবিলে রেট এডিট করুন"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className="inline-flex items-center justify-center w-8 h-8 border border-red-500/10 rounded-lg text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                                  title="ডিলিট করুন"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Production Rate Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18223c] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#131b2e]/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">বাল্ক প্রোডাকশন রেট প্রসেস</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setBulkResult(null);
                }}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleBulkProcess} className="p-6 space-y-4">
              {/* Process Description Box */}


              {/* Department & Section Select */}
              <div className="space-y-4">
                {/* Department Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building2 size={13} className="text-sky-400" />
                    <span>ডিপার্টমেন্ট (Department)</span>
                  </label>
                  <select
                    value={bulkDepartmentId}
                    onChange={(e) => {
                      setBulkDepartmentId(e.target.value);
                      setBulkSectionId('');
                    }}
                    className="w-full bg-[#0b0f19]/60 border border-white/10 rounded-xl py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
                  >
                    <option value="">-- সকল ডিপার্টমেন্ট (All Departments) --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.code ? `(${d.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Layers size={13} className="text-sky-400" />
                    <span>সেকশন (Section)</span>
                  </label>
                  <select
                    value={bulkSectionId}
                    onChange={(e) => setBulkSectionId(e.target.value)}
                    className="w-full bg-[#0b0f19]/60 border border-white/10 rounded-xl py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
                  >
                    <option value="">
                      {bulkDepartmentId ? '-- ডিপার্টমেন্টের সকল সেকশন --' : '-- সকল সেকশন (All Sections) --'}
                    </option>
                    {bulkFilteredSections.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    শুরুর তারিখ (Start Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={bulkStartDate}
                    onChange={(e) => setBulkStartDate(e.target.value)}
                    className="w-full bg-[#0b0f19]/60 border border-white/10 rounded-xl py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <p className="text-[10px] text-emerald-400/90 mt-1">
                    ✓ এই তারিখটি ইফেক্টিভ ডেট হিসেবে সেভ হবে
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    শেষ তারিখ (End Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={bulkEndDate}
                    onChange={(e) => setBulkEndDate(e.target.value)}
                    className="w-full bg-[#0b0f19]/60 border border-white/10 rounded-xl py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              {/* Result Summary Box */}
              {bulkResult && bulkResult.summary && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs space-y-2 text-emerald-300">
                  <div className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle size={16} />
                    <span>প্রসেসিং ফলাফল:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>• মোট কম্বিনেশন: <strong>{bulkResult.summary.totalCombos} টি</strong></div>
                    <div>• নতুন তৈরি হয়েছে: <strong>{bulkResult.summary.created} টি</strong></div>
                    <div>• পূর্বের রেট কপি: <strong>{bulkResult.summary.copiedFromPrev} টি</strong></div>
                    <div>• রেট ০ ধার্য হয়েছে: <strong>{bulkResult.summary.zeroRate} টি</strong></div>
                    <div>• পূর্বে বিদ্যমান ছিল: <strong>{bulkResult.summary.alreadyExisting} টি</strong></div>
                    <div>• ইফেক্টিভ ডেট: <strong>{bulkResult.summary.effectiveDate}</strong></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setBulkResult(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  {bulkResult ? 'বন্ধ করুন' : 'বাতিল'}
                </button>

                <button
                  type="submit"
                  disabled={bulkProcessing}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkProcessing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="text-amber-300" />
                      <span>প্রসেস শুরু করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

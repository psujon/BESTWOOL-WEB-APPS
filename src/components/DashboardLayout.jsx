import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, LogOut, Bell, ShieldAlert, Warehouse, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import { useUnit } from '../context/UnitContext';

export default function DashboardLayout({ 
  permissions, user, onLogout, sidebarOpen, setSidebarOpen 
}) {
  const location = useLocation();
  const {
    units,
    selectedUnitId,
    selectedUnit,
    canSwitchUnit,
    switchUnit,
    unitRefreshKey
  } = useUnit();
  
  // Extract route key from pathname (e.g. "/dashboard/buyer" -> "buyer")
  const getRouteKey = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'dashboard';
    
    // Extract segment after /dashboard/
    const segment = path.replace(/^\/dashboard\//, '');
    
    // Normalize to keys matching our tab titles dictionary
    if (segment === 'piece-rate') return 'piece_rate';
    if (segment === 'yarn-challan') return 'yarn_challan';
    if (segment === 'buyer-order-info') return 'buyer_order_info';
    if (segment === 'production-entry') return 'production_entry';
    if (segment === 'production-show') return 'production_show';
    if (segment === 'user-permission') return 'user_permission';
    if (segment === 'database-backup') return 'database_backup';
    if (segment === 'company-profile') return 'company_profile';
    if (segment === 'employee-info') return 'employee_info';
    return segment;
  };

  const activeTabKey = getRouteKey();

  const tabTitles = {
    dashboard: { title: 'ড্যাশবোর্ড ওভারভিউ', subtitle: 'সার্বিক ব্যবসায়িক পরিসংখ্যান' },
    buyer: { title: 'বায়ার ম্যানেজমেন্ট', subtitle: 'ক্রেতা প্রোফাইল ও বিবরণী' },
    style: { title: 'স্টাইল কনফিগারেশন', subtitle: 'পোশাকের বিবরণ ও মেটেরিয়াল' },
    process: { title: 'প্রোডাকশন প্রসেস সেটিংস', subtitle: 'কাজের প্রক্রিয়াজাতকরণ ধাপসমূহ' },
    color: { title: 'কালার কনফিগারেশন', subtitle: 'সেকশন ও স্টাইল ভিত্তিক পণ্য কালার সেটিং' },
    piece_rate: { title: 'পিস রেট সেটআপ', subtitle: 'ধাপভিত্তিক মজুরি ও রেট সেটিংস' },
    buyer_order_info: { title: 'বায়ার অর্ডার ইনফো', subtitle: 'পারচেজ অর্ডার (PO) কন্ট্রোল' },
    yarn_challan: { title: 'সুতা চালান ট্র্যাকিং', subtitle: 'সুতা সংগ্রহ ও ইনভেন্টরি লগ' },
    employee_info: { title: 'ইমপ্লয়ী ইনফরমেশন', subtitle: 'এক্টিভ কর্মকর্তা/কর্মচারীদের তালিকা ও ফাইল প্রোফাইল' },
    production_entry: { title: 'ডেইলি প্রোডাকশন এন্ট্রি', subtitle: 'ফ্লোর থেকে দৈনিক কাজের বিবরণী সংরক্ষণ' },
    production_show: { title: 'প্রোডাকশন রিপোর্ট শো', subtitle: 'উৎপাদিত পণ্যের সার্বিক হিসেব' },
    user: { title: 'ইউজার সেটিংস', subtitle: 'সিস্টেম অ্যাক্সেস অ্যাকাউন্টসমূহ' },
    user_permission: { title: 'ইউজার পারমিশন সেটিংস', subtitle: 'মেন্যু অ্যাক্সেস কন্ট্রোল লিস্ট (ACL)' },
    unit: { title: 'ইউনিট সেটিংস', subtitle: 'কারখানা ও বিভিন্ন ইউনিট ব্যবস্থাপনা' },
    section: { title: 'সেকশন সেটিংস', subtitle: 'কারখানার বিভাগসমূহ নিয়ন্ত্রণ প্যানেল' },
    company_profile: { title: 'কোম্পানী প্রোফাইল সেটিংস', subtitle: 'প্রতিষ্ঠানের লোগো, তথ্য ও প্রাতিষ্ঠানিক পরিচিতি' },
    database_backup: { title: 'ডাটাবেজ ব্যাকআপ প্যানেল', subtitle: 'MySQL ডাম্প ফাইল ও রিসোর্স রিকভারি' }
  };

  const currentHeader = tabTitles[activeTabKey] || { title: 'ড্যাশবোর্ড', subtitle: 'স্বাগতম' };

  return (
    <div className="flex min-h-screen relative bg-[#0b0f19]">
      {/* Sidebar Component */}
      <Sidebar 
        permissions={permissions} 
        user={user} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 w-screen h-screen bg-black/40 z-35 backdrop-blur-[4px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen bg-[#0b0f19] transition-all duration-300 ${
        sidebarOpen ? 'lg:pl-[280px]' : 'lg:pl-0'
      }`}>
        {/* Top Header */}
        <header className="h-[70px] bg-[#131b2e]/75 backdrop-blur-md border-b border-white/6 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 border border-white/6 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "সাইডবার লুকান (Hide Sidebar)" : "সাইডবার দেখান (Show Sidebar)"}
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-100 font-sans">{currentHeader.title}</h1>
              <span className="text-xs text-slate-400 mt-0.5">{currentHeader.subtitle}</span>
            </div>
          </div>

          {/* Active Unit Indicator & Switcher in Navbar */}
          <div className="flex items-center gap-2 bg-[#0b0f19]/90 border border-white/10 rounded-xl px-3.5 py-1.5 shadow-lg">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Warehouse size={15} />
            </div>
            
            <div className="flex flex-col">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold leading-tight flex items-center gap-1.5">
                <span>ইউনিট</span>
                {selectedUnitId === 'ALL' ? (
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded border border-emerald-500/20">ALL</span>
                ) : (
                  <span className="text-[9px] text-sky-400 font-bold bg-sky-500/10 px-1 rounded border border-sky-500/20">
                    {selectedUnit?.code || 'ACTIVE'}
                  </span>
                )}
              </div>

              {canSwitchUnit ? (
                <div className="relative flex items-center">
                  <select
                    value={selectedUnitId}
                    onChange={(e) => switchUnit(e.target.value)}
                    className="bg-transparent text-slate-100 text-xs font-bold focus:outline-none cursor-pointer pr-5 hover:text-sky-300 transition-colors"
                    title="ইউনিট পরিবর্তন করুন - পরিবর্তন করলে সকল তথ্য স্বয়ংক্রিয়ভাবে রিফ্রেশ হবে"
                  >
                    <option value="ALL" className="bg-[#131b2e] text-emerald-400 font-bold py-1">
                      🌐 সকল ইউনিট (All Units)
                    </option>
                    {units.map((u) => (
                      <option key={u.id} value={String(u.id)} className="bg-[#131b2e] text-slate-100 py-1 font-semibold">
                        🏭 {u.name} {u.code ? `(${u.code})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="text-slate-400 pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
                </div>
              ) : (
                <div className="text-xs font-bold text-sky-400 truncate max-w-[150px]" title={selectedUnit?.name || 'অ্যাসাইনকৃত ইউনিট'}>
                  {selectedUnit ? selectedUnit.name : 'ইউনিট নির্দিষ্ট নেই'}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.isMockMode && (
              <div 
                className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 padding py-1.5 px-3 rounded-lg text-xs font-semibold"
                title="MySQL disconnected."
              >
                <ShieldAlert size={14} />
                <span>Mock DB Mode</span>
              </div>
            )}

            <button className="relative w-9 h-9 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center" title="নোটিফিকেশন">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <button 
              className="bg-white/5 border border-white/6 hover:bg-white/10 text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs" 
              onClick={onLogout}
              title="লগআউট"
            >
              <LogOut size={16} />
              <span>লগআউট</span>
            </button>
          </div>
        </header>

        {/* Content Wrapper Slot with key for automatic remounting and refresh on unit switch */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet key={unitRefreshKey} context={{ selectedUnitId, selectedUnit, unitRefreshKey }} />
        </div>
      </main>
    </div>
  );
}

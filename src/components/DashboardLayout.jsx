import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, LogOut, Bell, ShieldAlert } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ 
  permissions, user, onLogout, sidebarOpen, setSidebarOpen 
}) {
  const location = useLocation();
  
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
    production_entry: { title: 'ডেইলি প্রোডাকশন এন্ট্রি', subtitle: 'ফ্লোর থেকে দৈনিক কাজের বিবরণী সংরক্ষণ' },
    production_show: { title: 'প্রোডাকশন রিপোর্ট শো', subtitle: 'উৎপাদিত পণ্যের সার্বিক হিসেব' },
    user: { title: 'ইউজার সেটিংস', subtitle: 'সিস্টেম অ্যাক্সেস অ্যাকাউন্টসমূহ' },
    user_permission: { title: 'ইউজার পারমিশন সেটিংস', subtitle: 'মেন্যু অ্যাক্সেস কন্ট্রোল লিস্ট (ACL)' },
    section: { title: 'সেকশন সেটিংস', subtitle: 'কারখানার বিভাগসমূহ নিয়ন্ত্রণ প্যানেল' },
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
      />

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 w-screen h-screen bg-black/40 z-35 backdrop-blur-[4px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:pl-[280px] min-h-screen bg-[#0b0f19] transition-all">
        {/* Top Header */}
        <header className="h-[70px] bg-[#131b2e]/75 backdrop-blur-md border-b border-white/6 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-300 hover:text-slate-100 cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-100 font-sans">{currentHeader.title}</h1>
              <span className="text-xs text-slate-400 mt-0.5">{currentHeader.subtitle}</span>
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

        {/* Content Wrapper Slot */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

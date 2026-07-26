import React, { useState } from 'react';
import { Shield, ShieldCheck } from 'lucide-react';

export default function UserPermission() {
  const [users, setUsers] = useState([
    { id: 1, name: 'System Admin', role: 'admin' },
    { id: 2, name: 'Production Manager', role: 'manager' }
  ]);

  const [permissions, setPermissions] = useState({
    '1-buyer': true,
    '1-style': true,
    '1-process': true,
    '1-piece_rate': true,
    '1-yarn_challan': true,
    '1-buyer_order_info': true,
    '1-production_entry': true,
    '1-production_show': true,
    '1-user': true,
    '1-user_permission': true,
    '1-database_backup': true,
    '2-buyer': true,
    '2-style': true,
    '2-process': false,
    '2-piece_rate': false,
    '2-yarn_challan': false,
    '2-buyer_order_info': false,
    '2-production_entry': true,
    '2-production_show': true,
    '2-user': false,
    '2-user_permission': false,
    '2-database_backup': false
  });

  const [toastMessage, setToastMessage] = useState('');

  const handleToggle = (userId, menuKey) => {
    const key = `${userId}-${menuKey}`;
    const newValue = !permissions[key];
    
    setPermissions({
      ...permissions,
      [key]: newValue
    });

    const user = users.find(u => u.id === userId);
    setToastMessage(`✅ ${user.name} এর জন্য "${menuKey}" অনুমতি ${newValue ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে!`);
    
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const menuList = [
    { key: 'buyer', label: 'Buyer (বায়ার)' },
    { key: 'style', label: 'Style (স্টাইল)' },
    { key: 'process', label: 'Process (প্রসেস)' },
    { key: 'piece_rate', label: 'Piece Rate (পিস রেট)' },
    { key: 'yarn_challan', label: 'Yarn Challan (ইয়ার্ন চালান)' },
    { key: 'buyer_order_info', label: 'Buyer Order Info (বায়ার অর্ডার ইনফো)' },
    { key: 'production_entry', label: 'Production Entry (প্রোডাকশন এন্ট্রি)' },
    { key: 'production_show', label: 'Production Show (প্রোডাকশন শো)' },
    { key: 'user', label: 'User Settings (ইউজার সেটিংস)' },
    { key: 'user_permission', label: 'Permissions (অনুমতি কনফিগার)' },
    { key: 'database_backup', label: 'Database Backup (ব্যাকআপ)' }
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm rounded-lg leading-relaxed">
        ইউজার পারমিশন কন্ট্রোল প্যানেল। এখান থেকে প্রতিটি ব্যবহারকারীর জন্য ড্যাশবোর্ডের কোন মেন্যু দৃশ্যমান বা অ্যাক্সেসযোগ্য হবে তা নির্ধারণ করা যায়।
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Shield size={18} className="text-sky-400" />
          মেন্যু অ্যাক্সেস পারমিশন ম্যাট্রিক্স
        </h3>
      </div>

      {toastMessage && (
        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg animate-[fadeIn_0.3s_ease-in-out]">
          {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl" key={user.id}>
            <div className="flex items-center justify-between border-b border-white/6 pb-4 mb-4">
              <div>
                <strong className="text-base text-slate-100">{user.name}</strong>
                <div className="text-xs text-slate-400 mt-0.5">রোল: {user.role}</div>
              </div>
              <ShieldCheck size={20} className={user.role === 'admin' ? 'text-red-400' : 'text-sky-400'} />
            </div>

            <div className="flex flex-col gap-2">
              {menuList.map((menu) => {
                const isChecked = !!permissions[`${user.id}-${menu.key}`];
                return (
                  <div className="flex items-center justify-between py-2 border-b border-white/[0.03]" key={menu.key}>
                    <span className="text-sm text-slate-300">{menu.label}</span>
                    <div 
                      onClick={() => handleToggle(user.id, menu.key)}
                      className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 ${
                        isChecked ? 'bg-sky-500' : 'bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        isChecked ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

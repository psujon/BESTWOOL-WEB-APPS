import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function User({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('operator');

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setLoading(false);
      });
  }, [token, refresh]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!name || !username || !password) {
      toast.error('নাম, ইউজারনেম ও পাসওয়ার্ড পূরণ করা বাধ্যতামূলক!');
      return;
    }

    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, username, password, email, role })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create user');
        return data;
      })
      .then(() => {
        toast.success('ব্যবহারকারী সফলভাবে তৈরি করা হয়েছে!');
        setName('');
        setUsername('');
        setPassword('');
        setEmail('');
        setRefresh(!refresh);
      })
      .catch(err => {
        toast.error(err.message);
      });
  };

  const handleRoleChange = (userId, newRole) => {
    fetch(`http://localhost:5000/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update role');
        return data;
      })
      .then(() => {
        toast.success(`ইউজার রোল সফলভাবে "${newRole}" এ পরিবর্তিত করা হয়েছে!`);
        setRefresh(!refresh);
      })
      .catch(err => toast.error(err.message));
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* User Creation Form */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <UserPlus size={18} className="text-sky-400" />
            নতুন ইউজার তৈরি করুন
          </h3>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ইউজার এর পূর্ণ নাম *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="রহমান আলী"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ইউজারনেম (লগইন আইডি) *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="rahman"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">পাসওয়ার্ড *</label>
              <input
                type="password"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ইমেইল এড্রেস</label>
              <input
                type="email"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahman@bestwool.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">অ্যাক্সেস রোল (Role)</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors font-medium"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="operator">Operator (অপারেটর মোড - নির্দিষ্ট পেজ অ্যাক্সেস)</option>
                <option value="user">User (সাধারণ ব্যবহারকারী)</option>
                <option value="admin">Admin (সিস্টেম এডমিন - ফুল অ্যাক্সেস)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold pt-2"
            >
              ইউজার তৈরি করুন
            </button>
          </form>
        </div>

        {/* User Table List & Role Changer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">ইউজার তালিকা ও রোল পরিবর্তন</h3>
            <span className="text-xs text-slate-400">মোট রেজিস্টার্ড: {users.length} জন</span>
          </div>

          {loading ? (
            <div className="text-slate-400">লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">পূর্ণ নাম</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">ইউজারনেম</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">ইমেইল</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">রোল (Role) পরিবর্তন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3.5 px-4 text-slate-200"><strong>{u.name}</strong></td>
                      <td className="py-3.5 px-4"><span className="text-sky-400">@{u.username}</span></td>
                      <td className="py-3.5 px-4 text-slate-300">{u.email || '—'}</td>
                      <td className="py-3.5 px-4">
                        <select
                          className={`bg-[#0b0f19] border border-white/10 rounded px-2.5 py-1 text-xs font-bold focus:outline-none transition-colors cursor-pointer uppercase ${u.role === 'admin'
                              ? 'text-red-400 border-red-500/30'
                              : u.role === 'operator'
                                ? 'text-emerald-400 border-emerald-500/30'
                                : 'text-sky-400 border-sky-500/30'
                            }`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="operator" className="bg-[#131b2e] text-emerald-400">OPERATOR (অপারেটর)</option>
                          <option value="user" className="bg-[#131b2e] text-sky-400">USER (ইউজার)</option>
                          <option value="admin" className="bg-[#131b2e] text-red-400">ADMIN (এডমিন)</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

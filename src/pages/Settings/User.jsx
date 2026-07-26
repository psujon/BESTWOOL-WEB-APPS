import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';

export default function User({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setLoading(false);
      });
  }, [token, refresh]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!name || !username || !password) return;

    setMessage('');
    setIsError(false);

    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, username, password, email, role })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
      })
      .then(data => {
        setMessage('✅ ব্যবহারকারী সফলভাবে তৈরি করা হয়েছে!');
        setName('');
        setUsername('');
        setPassword('');
        setEmail('');
        setRefresh(!refresh);
      })
      .catch(err => {
        setMessage(`❌ ${err.message}`);
        setIsError(true);
      });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm rounded-lg leading-relaxed">
        সিস্টেম ইউজার সেটিংস। এখান থেকে ড্যাশবোর্ড ব্যবহারের জন্য নতুন কর্মকর্তা/ইউজারদের অ্যাকাউন্ট তৈরি করা যায় এবং তাদের রোল পরিবর্তন করা যায়।
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <UserPlus size={18} className="text-sky-400" />
            নতুন ইউজার তৈরি করুন
          </h3>

          {message && (
            <div 
              className={`mb-5 p-3.5 border rounded-lg text-sm ${
                isError 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              {message}
            </div>
          )}

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
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User (সাধারণ ব্যবহারকারী)</option>
                <option value="manager">Manager (ম্যানেজার)</option>
                <option value="admin">Admin (সিস্টেম এডমিন)</option>
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

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">ইউজার তালিকা</h3>
            <span className="text-xs text-slate-400">মোট রেজিস্টার্ড: {users.length} জন</span>
          </div>

          {loading ? (
            <div className="text-slate-400">লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold">পূর্ণ নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ইউজারনেম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ইমেইল</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">রোল (Role)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3.5 px-4 text-slate-200"><strong>{user.name}</strong></td>
                      <td className="py-3.5 px-4"><span className="text-sky-400">@{user.username}</span></td>
                      <td className="py-3.5 px-4 text-slate-300">{user.email || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : user.role === 'manager' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}>
                          {user.role}
                        </span>
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

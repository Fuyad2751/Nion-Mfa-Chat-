import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/login', { email, password });
      localStorage.setItem('mfaAdmin', 'true');
      setIsLoggedIn(true);
      toast.success('অ্যাডমিন লগইন সফল!');
    } catch (error) {
      toast.error('অ্যাডমিন অনুমোদন ব্যর্থ');
    }
  };

  const loadDashboard = async () => {
    try {
      const { data } = await API.get('/admin/dashboard');
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`তুমি কি নিশ্চিত ${userName} কে ডিলিট করতে চাও?`)) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success(`${userName} ডিলিট করা হয়েছে`);
      loadUsers();
      loadDashboard();
    } catch (error) {
      toast.error('ডিলিট ব্যর্থ');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('mfaAdmin') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboard();
      loadUsers();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-4">
        <Toaster position="top-center" toastOptions={{ style: { background: '#1A1A1A', color: '#E0E0E0' } }} />
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#FF007F]"
              style={{ textShadow: '0 0 15px #FF007F, 0 0 40px #FF007F' }}>
              🔐 অ্যাডমিন প্যানেল
            </h1>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <input
              type="email"
              placeholder="অ্যাডমিন ইমেইল"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-transparent border-2 border-[#FF007F]/40 rounded-xl text-gray-200 outline-none"
            />
            <input
              type="password"
              placeholder="অ্যাডমিন পাসওয়ার্ড"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-transparent border-2 border-[#FF007F]/40 rounded-xl text-gray-200 outline-none"
            />
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#FF007F] to-[#00F0FF] rounded-xl text-black font-bold">
              লগইন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] p-4 md:p-6">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        {/* হেডার */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#FF007F]"
            style={{ textShadow: '0 0 10px #FF007F, 0 0 30px #FF007F' }}>
            🛡️ অ্যাডমিন প্যানেল
          </h1>
          <button
            onClick={() => { localStorage.removeItem('mfaAdmin'); setIsLoggedIn(false); }}
            className="px-4 py-2 border border-[#FF007F]/30 text-[#FF007F] rounded-lg hover:bg-[#FF007F]/10"
          >
            লগআউট
          </button>
        </div>

        {/* ট্যাব */}
        <div className="flex gap-2 mb-6">
          {['dashboard', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all
                ${activeTab === tab ? 'bg-[#FF007F]/20 text-[#FF007F] border border-[#FF007F]/30' : 'text-gray-400 hover:text-white'}`}
            >
              {tab === 'dashboard' ? '📊 ড্যাশবোর্ড' : '👥 ইউজার'}
            </button>
          ))}
        </div>

        {/* ড্যাশবোর্ড */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'মোট ইউজার', value: stats.totalUsers, icon: '👥', color: '#00F0FF' },
              { label: 'মোট মেসেজ', value: stats.totalMessages, icon: '💬', color: '#FF007F' },
              { label: 'মোট গ্রুপ', value: stats.totalGroups, icon: '👥', color: '#FF007F' },
              { label: 'আজ ইউজার', value: stats.todayUsers, icon: '🆕', color: '#00F0FF' },
              { label: 'আজ মেসেজ', value: stats.todayMessages, icon: '📨', color: '#FF007F' },
              { label: 'পেন্ডিং', value: stats.pendingRequests, icon: '🔔', color: '#FF007F' },
            ].map((item, i) => (
              <div key={i} className="bg-[#0F0F15] border border-[#00F0FF]/10 rounded-xl p-4 text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-3xl font-bold mt-2" style={{ color: item.color }}>{item.value}</p>
                <p className="text-gray-400 text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ইউজার টেবিল */}
        {activeTab === 'users' && (
          <div className="bg-[#0F0F15] rounded-xl border border-[#00F0FF]/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#00F0FF]/10 text-gray-400 text-left">
                  <th className="p-3">নাম</th>
                  <th className="p-3 hidden md:table-cell">ইমেইল</th>
                  <th className="p-3">বন্ধু</th>
                  <th className="p-3 hidden md:table-cell">তারিখ</th>
                  <th className="p-3">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-[#00F0FF]/5 hover:bg-[#1A1A20]">
                    <td className="p-3 text-gray-200">{u.name}</td>
                    <td className="p-3 text-gray-400 hidden md:table-cell text-xs">{u.email}</td>
                    <td className="p-3 text-gray-400">{u.friendsCount}</td>
                    <td className="p-3 text-gray-500 hidden md:table-cell text-xs">
                      {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="text-red-400 hover:text-red-300 text-xs border border-red-500/20 px-2 py-1 rounded"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
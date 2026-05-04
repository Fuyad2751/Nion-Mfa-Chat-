import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('সব ফিল্ড পুরণ করো');
    }
    try {
      setLoading(true);
      await login(email, password);
      toast.success('লগইন সফল!');
      navigate('/chat');
    } catch (error) {
      toast.error(error.response?.data?.message || 'লগইন ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-4">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1A1A1A', color: '#E0E0E0' } }} />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[#00F0FF] tracking-wider"
            style={{ textShadow: '0 0 10px #00F0FF, 0 0 40px #00F0FF, 0 0 80px #00F0FF' }}>
            Mfa Chat
          </h1>
          <p className="text-[#FF007F] mt-2 text-lg"
            style={{ textShadow: '0 0 8px #FF007F, 0 0 20px #FF007F' }}>
            Online Chat
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-transparent border-2 border-[#00F0FF]/40 rounded-xl 
                         text-gray-200 placeholder-gray-500 outline-none
                         focus:border-[#00F0FF] focus:shadow-[0_0_15px_#00F0FF,0_0_30px_#00F0FF]
                         transition-all duration-300"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-transparent border-2 border-[#FF007F]/40 rounded-xl 
                         text-gray-200 placeholder-gray-500 outline-none
                         focus:border-[#FF007F] focus:shadow-[0_0_15px_#FF007F,0_0_30px_#FF007F]
                         transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#00F0FF] to-[#FF007F] rounded-xl text-black font-bold text-lg
                       hover:shadow-[0_0_20px_#00F0FF,0_0_40px_#FF007F] hover:scale-[1.02]
                       transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'অপেক্ষা করো...' : 'লগইন'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          অ্যাকাউন্ট নেই?{' '}
          <Link to="/register" className="text-[#00F0FF] hover:text-[#FF007F] transition-colors">
            রেজিস্টার করো
          </Link>
        </p>
        <p className="text-center text-gray-600 text-xs mt-4">
          Made by <span className="text-[#FF007F] font-medium">Md Fuyad Akand</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return toast.error('সব ফিল্ড পুরণ করো');
    }
    if (password !== confirmPassword) {
      return toast.error('পাসওয়ার্ড মিলছে না');
    }
    if (password.length < 6) {
      return toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
    }
    try {
      setLoading(true);
      await register(name, email, password);
      toast.success('রেজিস্টার সফল!');
      navigate('/chat');
    } catch (error) {
      toast.error(error.response?.data?.message || 'রেজিস্টার ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-4">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1A1A1A', color: '#E0E0E0' } }} />
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[#00F0FF] tracking-wider"
            style={{ textShadow: '0 0 10px #00F0FF, 0 0 40px #00F0FF, 0 0 80px #00F0FF' }}>
            Mfa Chat
          </h1>
          <p className="text-[#FF007F] mt-2 text-lg"
            style={{ textShadow: '0 0 8px #FF007F, 0 0 20px #FF007F' }}>
            নতুন অ্যাকাউন্ট তৈরি করো
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="নাম"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-transparent border-2 border-[#00F0FF]/40 rounded-xl 
                       text-gray-200 placeholder-gray-500 outline-none
                       focus:border-[#00F0FF] focus:shadow-[0_0_15px_#00F0FF,0_0_30px_#00F0FF]
                       transition-all duration-300"
          />
          <input
            type="email"
            placeholder="ইমেইল"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-transparent border-2 border-[#00F0FF]/40 rounded-xl 
                       text-gray-200 placeholder-gray-500 outline-none
                       focus:border-[#00F0FF] focus:shadow-[0_0_15px_#00F0FF,0_0_30px_#00F0FF]
                       transition-all duration-300"
          />
          <input
            type="password"
            placeholder="পাসওয়ার্ড"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-transparent border-2 border-[#FF007F]/40 rounded-xl 
                       text-gray-200 placeholder-gray-500 outline-none
                       focus:border-[#FF007F] focus:shadow-[0_0_15px_#FF007F,0_0_30px_#FF007F]
                       transition-all duration-300"
          />
          <input
            type="password"
            placeholder="পাসওয়ার্ড নিশ্চিত করো"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-5 py-4 bg-transparent border-2 border-[#FF007F]/40 rounded-xl 
                       text-gray-200 placeholder-gray-500 outline-none
                       focus:border-[#FF007F] focus:shadow-[0_0_15px_#FF007F,0_0_30px_#FF007F]
                       transition-all duration-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#00F0FF] to-[#FF007F] rounded-xl text-black font-bold text-lg
                       hover:shadow-[0_0_20px_#00F0FF,0_0_40px_#FF007F] hover:scale-[1.02]
                       transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'অপেক্ষা করো...' : 'রেজিস্টার'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          আগে থেকেই অ্যাকাউন্ট আছে?{' '}
          <Link to="/login" className="text-[#00F0FF] hover:text-[#FF007F] transition-colors">
            লগইন করো
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
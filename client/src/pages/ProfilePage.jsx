import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';

const ProfilePage = ({ onBack }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await API.get('/auth/profile');
      setName(data.name);
      setAvatar(data.avatar);
      setFriends(data.friends || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ছবি ৫MB-এর বেশি হতে পারবে না');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);

      if (fileRef.current?.files[0]) {
        formData.append('avatar', fileRef.current.files[0]);
      }

      const { data } = await API.put('/auth/profile', formData);

      // লোকাল ইউজার আপডেট
      localStorage.setItem('mfaUser', JSON.stringify({
        ...user,
        name: data.name,
        avatar: data.avatar,
      }));

      toast.success('প্রোফাইল আপডেট হয়েছে!');
      setTimeout(() => onBack?.() || navigate('/chat'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'আপডেট ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-4">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1A1A1A', color: '#E0E0E0' } }} />

      <div className="w-full max-w-md">
        {/* ব্যাক বাটন */}
        <button
          onClick={() => onBack?.() || navigate('/chat')}
          className="mb-6 text-gray-400 hover:text-[#00F0FF] transition-colors text-lg"
        >
          ← ফিরে যাও
        </button>

        <h2 className="text-3xl font-bold text-[#00F0FF] mb-8 text-center"
          style={{ textShadow: '0 0 10px #00F0FF, 0 0 30px #00F0FF' }}>
          প্রোফাইল
        </h2>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* প্রোফাইল ছবি */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#FF007F] 
                              flex items-center justify-center text-white font-bold text-3xl overflow-hidden"
                style={{ boxShadow: '0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(255,0,127,0.3)' }}>
                {avatar ? (
                  <img src={avatar} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center 
                              opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs">বদলাও</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-gray-500 text-xs mt-2">ট্যাপ করো ছবি বদলাতে</p>
          </div>

          {/* নাম */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">নাম</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 bg-transparent border-2 border-[#00F0FF]/30 rounded-xl
                         text-gray-200 outline-none
                         focus:border-[#00F0FF] focus:shadow-[0_0_15px_#00F0FF,0_0_30px_#00F0FF]
                         transition-all duration-300"
            />
          </div>

          {/* ইমেইল (অপরিবর্তনীয়) */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">ইমেইল</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full px-5 py-3.5 bg-[#1A1A20] border-2 border-gray-700 rounded-xl
                         text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* বন্ধু সংখ্যা */}
          <div className="text-center text-gray-400 text-sm">
            মোট বন্ধু: <span className="text-[#FF007F] font-bold">{friends.length}</span>
          </div>

          {/* সেভ বাটন */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#00F0FF] to-[#FF007F] rounded-xl text-black font-bold text-lg
                       hover:shadow-[0_0_20px_#00F0FF,0_0_40px_#FF007F] hover:scale-[1.02]
                       transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'সেভ হচ্ছে...' : 'সেভ করো'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
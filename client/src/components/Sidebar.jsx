import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

// পেন্ডিং রিকোয়েস্ট কম্পোনেন্ট
const PendingRequests = ({ onUpdate }) => {
  const [requests, setRequests] = useState([]);
  const [show, setShow] = useState(false);

  const loadRequests = async () => {
    try {
      const { data } = await API.get('/friends/requests');
      setRequests(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await API.put(`/friends/accept/${requestId}`);
      toast.success('ফ্রেন্ড রিকোয়েস্ট অ্যাকসেপ্ট!');
      loadRequests();
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'ব্যর্থ');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await API.put(`/friends/reject/${requestId}`);
      toast.success('রিকোয়েস্ট রিজেক্ট করা হয়েছে');
      loadRequests();
      onUpdate();
    } catch (error) {
      toast.error('ব্যর্থ');
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (requests.length === 0 && !show) return null;

  return (
    <div className="mx-3 mt-2">
      <button
        onClick={() => { setShow(!show); if (!show) loadRequests(); }}
        className="w-full px-4 py-2.5 bg-[#FF007F]/10 border border-[#FF007F]/30 rounded-lg
                   text-[#FF007F] text-sm hover:bg-[#FF007F]/20 transition-all"
      >
        🔔 {requests.length}টি পেন্ডিং ফ্রেন্ড রিকোয়েস্ট {show ? '▲' : '▼'}
      </button>

      {show && (
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
          {requests.map((req) => (
            <div key={req._id} className="p-3 bg-[#1A1A20] rounded-lg border border-[#FF007F]/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F0FF]/50 to-[#FF007F]/50 
                                flex items-center justify-center text-white text-xs font-bold">
                  {req.sender?.name?.charAt(0)}
                </div>
                <span className="text-gray-300 text-sm">{req.sender?.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(req._id)}
                  className="flex-1 px-2 py-1.5 text-xs bg-[#00F0FF]/20 border border-[#00F0FF]/40 
                             text-[#00F0FF] rounded-lg hover:bg-[#00F0FF] hover:text-black transition-all"
                >
                  ✓ অ্যাকসেপ্ট
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  className="flex-1 px-2 py-1.5 text-xs bg-[#FF007F]/10 border border-[#FF007F]/30 
                             text-[#FF007F] rounded-lg hover:bg-[#FF007F]/20 transition-all"
                >
                  ✕ রিজেক্ট
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-gray-500 text-xs text-center py-2">কোনো পেন্ডিং রিকোয়েস্ট নেই</p>
          )}
        </div>
      )}
    </div>
  );
};

// প্রধান Sidebar কম্পোনেন্ট
const Sidebar = ({ user, onlineUsers, selectedFriend, onSelectFriend, onLogout, onProfile }) => {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const loadFriends = async () => {
    try {
      const { data } = await API.get('/friends');
      setFriends(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadPendingCount = async () => {
    try {
      const { data } = await API.get('/friends/requests');
      setPendingCount(data.length);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadFriends();
    loadPendingCount();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await API.get(`/friends/search?q=${query}`);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendRequest = async (userId) => {
    try {
      await API.post(`/friends/request/${userId}`);
      toast.success('ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে!');
      setSearchResults(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'ব্যর্থ');
    }
  };

  return (
    <div className="h-full bg-[#0F0F15] border-r border-[#00F0FF]/10 flex flex-col">
      {/* হেডার */}
      <div className="p-4 border-b border-[#00F0FF]/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-[#00F0FF]"
            style={{ textShadow: '0 0 8px #00F0FF' }}>
            Mfa Chat
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-9 h-9 rounded-lg border border-[#00F0FF]/30 text-[#00F0FF] 
                         hover:bg-[#00F0FF]/10 transition-all flex items-center justify-center text-sm"
            >
              🔍
            </button>
            <button
              onClick={onProfile}
              className="w-9 h-9 rounded-lg border border-[#00F0FF]/30 text-[#00F0FF] 
                         hover:bg-[#00F0FF]/10 transition-all flex items-center justify-center text-sm"
              title="প্রোফাইল"
            >
              👤
            </button>
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-lg border border-[#FF007F]/30 text-[#FF007F] 
                         hover:bg-[#FF007F]/10 transition-all flex items-center justify-center text-sm"
              title="লগআউট"
            >
              🚪
            </button>
          </div>
        </div>

        {/* ইউজার প্রোফাইল */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#FF007F] 
                          flex items-center justify-center text-white font-bold text-lg overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-200 font-medium truncate">{user?.name}</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              অনলাইন
            </p>
          </div>
        </div>
      </div>

      {/* সার্চ বার */}
      {showSearch && (
        <div className="p-3 border-b border-[#00F0FF]/10">
          <input
            type="text"
            placeholder="ইউজার সার্চ করো..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#1A1A20] border border-[#00F0FF]/20 rounded-lg
                       text-gray-200 placeholder-gray-500 outline-none text-sm
                       focus:border-[#00F0FF] focus:shadow-[0_0_10px_#00F0FF]
                       transition-all duration-300"
            autoFocus
          />
          {/* সার্চ রেজাল্ট */}
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {searchResults.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-2 hover:bg-[#00F0FF]/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F0FF]/50 to-[#FF007F]/50 
                                    flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        u.name?.charAt(0)
                      )}
                    </div>
                    <span className="text-gray-300 text-sm">{u.name}</span>
                  </div>
                  <button
                    onClick={() => sendRequest(u._id)}
                    className="px-3 py-1 text-xs border border-[#00F0FF]/40 text-[#00F0FF] rounded-lg
                               hover:bg-[#00F0FF] hover:text-black transition-all"
                  >
                    + অ্যাড
                  </button>
                </div>
              ))}
            </div>
          )}
          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <p className="text-gray-500 text-sm mt-2 text-center">কোনো ইউজার পাওয়া যায়নি</p>
          )}
        </div>
      )}

      {/* পেন্ডিং রিকোয়েস্ট */}
      <PendingRequests
        onUpdate={() => {
          loadFriends();
          loadPendingCount();
        }}
      />

      {/* ফ্রেন্ড লিস্ট */}
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-gray-500 text-xs uppercase tracking-wider px-3 py-2">বন্ধুরা</p>
        {friends.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">এখনো কোনো বন্ধু নেই</p>
        ) : (
          friends.map((friend) => {
            const isOnline = onlineUsers.includes(friend._id);
            const isSelected = selectedFriend?._id === friend._id;
            return (
              <button
                key={friend._id}
                onClick={() => onSelectFriend(friend)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-all duration-200
                  ${isSelected
                    ? 'bg-[#00F0FF]/10 border border-[#00F0FF]/30'
                    : 'hover:bg-[#1A1A20] border border-transparent'
                  }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F0FF]/40 to-[#FF007F]/40 
                                  flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {friend.avatar ? (
                      <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      friend.name?.charAt(0)
                    )}
                  </div>
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full 
                                     border-2 border-[#0F0F15]"
                      style={{ boxShadow: '0 0 6px #4ade80, 0 0 12px #4ade80' }}
                    ></span>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-gray-200 text-sm font-medium truncate">{friend.name}</p>
                  <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                    {isOnline ? 'অনলাইন' : 'অফলাইন'}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
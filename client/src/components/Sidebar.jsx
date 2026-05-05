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

// গ্রুপ তৈরি মোডাল
const CreateGroupModal = ({ friends, onClose, onCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return toast.error('গ্রুপের নাম দাও');
    if (selectedMembers.length === 0) return toast.error('কমপক্ষে একজন মেম্বার সিলেক্ট করো');

    try {
      setLoading(true);
      await API.post('/groups', { name: groupName.trim(), members: selectedMembers });
      toast.success('গ্রুপ তৈরি হয়েছে!');
      onCreated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'গ্রুপ তৈরি ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#0F0F15] border border-[#00F0FF]/20 rounded-2xl w-full max-w-md p-5 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#00F0FF]"
            style={{ textShadow: '0 0 8px #00F0FF' }}>
            নতুন গ্রুপ তৈরি
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <input
          type="text"
          placeholder="গ্রুপের নাম"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full px-4 py-3 bg-[#1A1A20] border border-[#00F0FF]/20 rounded-xl
                     text-gray-200 placeholder-gray-500 outline-none text-sm mb-4
                     focus:border-[#00F0FF] focus:shadow-[0_0_10px_#00F0FF] transition-all"
          autoFocus
        />

        <p className="text-gray-400 text-xs mb-2">মেম্বার সিলেক্ট করো:</p>
        <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
          {friends.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-4">কোনো বন্ধু নেই</p>
          ) : (
            friends.map((friend) => (
              <label
                key={friend._id}
                className="flex items-center gap-3 p-2.5 hover:bg-[#00F0FF]/5 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(friend._id)}
                  onChange={() => toggleMember(friend._id)}
                  className="accent-[#00F0FF] w-4 h-4"
                />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00F0FF]/40 to-[#FF007F]/40 
                                flex items-center justify-center text-white text-xs font-bold">
                  {friend.name?.charAt(0)}
                </div>
                <span className="text-gray-300 text-sm">{friend.name}</span>
              </label>
            ))
          )}
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !groupName.trim() || selectedMembers.length === 0}
          className="w-full py-3 bg-gradient-to-r from-[#00F0FF] to-[#FF007F] rounded-xl text-black font-bold
                     hover:shadow-[0_0_20px_#00F0FF,0_0_40px_#FF007F] transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'তৈরি হচ্ছে...' : 'গ্রুপ তৈরি করো'}
        </button>
      </div>
    </div>
  );
};

// প্রধান Sidebar কম্পোনেন্ট
const Sidebar = ({ user, onlineUsers, selectedFriend, selectedGroup, onSelectFriend, onSelectGroup, onLogout, onProfile }) => {
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');

  // ✅ loadFriends ফাংশন
  const loadFriends = async () => {
    try {
      const { data } = await API.get('/friends');
      setFriends(data);
    } catch (error) {
      console.error('loadFriends error:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const { data } = await API.get('/groups');
      setGroups(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadFriends();
    loadGroups();
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

  const handleDeleteFriend = async (friendId, friendName) => {
    if (!window.confirm(`তুমি কি নিশ্চিত ${friendName} কে বন্ধু তালিকা থেকে সরাতে চাও?`)) return;
    try {
      await API.delete(`/friends/remove/${friendId}`);
      toast.success(`${friendName} কে বন্ধু তালিকা থেকে সরানো হয়েছে`);
      loadFriends();
      loadGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'ডিলিট ব্যর্থ');
    }
  };

  return (
    <div className="h-full bg-[#0F0F15] border-r border-[#00F0FF]/10 flex flex-col">
      {/* হেডার - WhatsApp স্টাইল */}
      <div className="p-4 bg-[#075e54] text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Mfa Chat</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowSearch(!showSearch)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-sm">🔍</button>
            <button onClick={onProfile} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-sm">👤</button>
            <button onClick={onLogout} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-sm">🚪</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{user?.name}</p>
            <p className="text-white/70 text-xs">অনলাইন</p>
          </div>
        </div>
      </div>

      {/* ট্যাব */}
      <div className="flex bg-[#075e54] text-white/80">
        <button onClick={() => setActiveTab('friends')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'friends' ? 'border-white text-white' : 'border-transparent'}`}>বন্ধুরা</button>
        <button onClick={() => setActiveTab('groups')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'groups' ? 'border-white text-white' : 'border-transparent'}`}>গ্রুপ</button>
      </div>

      {/* সার্চ */}
      {showSearch && (
        <div className="p-3 bg-white border-b">
          <input type="text" placeholder="ইউজার সার্চ করো..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm outline-none" autoFocus />
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {searchResults.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">{u.name?.charAt(0)}</div>
                    <span className="text-gray-700 text-sm">{u.name}</span>
                  </div>
                  <button onClick={() => sendRequest(u._id)} className="px-3 py-1 text-xs bg-[#075e54] text-white rounded-full">+ অ্যাড</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* পেন্ডিং */}
      {activeTab === 'friends' && <PendingRequests onUpdate={() => { loadFriends(); }} />}

      {/* লিস্ট */}
      <div className="flex-1 overflow-y-auto bg-white">
        {activeTab === 'friends' ? (
          friends.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">এখনো কোনো বন্ধু নেই</p>
          ) : (
            friends.map((friend) => {
              const isOnline = onlineUsers.includes(friend._id);
              const isSelected = selectedFriend?._id === friend._id;
              return (
                <div key={friend._id} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-gray-100' : ''}`}
                  onClick={() => onSelectFriend(friend)}>
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">{friend.name?.charAt(0)}</div>
                    {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{friend.name}</p>
                    <p className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>{isOnline ? 'অনলাইন' : 'অফলাইন'}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteFriend(friend._id, friend.name); }}
                    className="text-red-400 hover:text-red-600 p-1">🗑️</button>
                </div>
              );
            })
          )
        ) : (
          <div className="p-4">
            <button onClick={() => setShowGroupModal(true)} className="w-full py-3 bg-[#075e54] text-white rounded-full text-sm font-medium">+ নতুন গ্রুপ</button>
            {groups.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">কোনো গ্রুপ নেই</p> : groups.map((group) => (
              <div key={group._id} onClick={() => onSelectGroup?.(group)} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer mt-2">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">👥</div>
                <div><p className="text-gray-900 text-sm font-medium">{group.name}</p><p className="text-xs text-gray-400">{group.members?.length || 0} জন</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* গ্রুপ মোডাল */}
      {showGroupModal && <CreateGroupModal friends={friends} onClose={() => setShowGroupModal(false)} onCreated={() => { loadGroups(); }} />}
    </div>
  );
};

export default Sidebar;
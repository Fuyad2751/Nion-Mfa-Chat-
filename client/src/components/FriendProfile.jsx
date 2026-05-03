import API from '../utils/api';
import toast from 'react-hot-toast';

const FriendProfile = ({ friend, onClose, onlineUsers }) => {
  const isOnline = onlineUsers.includes(friend._id);

  const handleRemoveFriend = async () => {
    if (!confirm(`তুমি কি নিশ্চিত ${friend.name} কে বন্ধু তালিকা থেকে সরাতে চাও?`)) return;
    try {
      await API.delete(`/friends/remove/${friend._id}`);
      toast.success('বন্ধু রিমুভ করা হয়েছে');
      onClose();
    } catch (error) {
      toast.error('ব্যর্থ');
    }
  };

  return (
    <div className="h-full bg-[#0F0F15] p-5">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-[#00F0FF] font-bold">প্রোফাইল</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#FF007F] 
                          flex items-center justify-center text-white font-bold text-3xl"
            style={{ boxShadow: '0 0 20px rgba(0,240,255,0.3), 0 0 40px rgba(255,0,127,0.2)' }}>
            {friend.name?.charAt(0)}
          </div>
          {isOnline && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0F0F15]"
              style={{ boxShadow: '0 0 10px #4ade80, 0 0 20px #4ade80' }}
            ></span>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-200">{friend.name}</h2>
        <p className="text-sm text-gray-400 mt-1">{friend.email}</p>
        <p className={`text-sm mt-2 ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
          {isOnline ? '🟢 অনলাইন' : '⚫ অফলাইন'}
        </p>

        <button
          onClick={handleRemoveFriend}
          className="mt-6 px-6 py-2.5 border border-[#FF007F]/40 text-[#FF007F] rounded-xl
                     hover:bg-[#FF007F] hover:text-black transition-all duration-300 text-sm"
        >
          বন্ধু রিমুভ করো
        </button>
      </div>
    </div>
  );
};

export default FriendProfile;
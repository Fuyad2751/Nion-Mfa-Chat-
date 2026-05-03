import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const GroupChat = ({ group, onBack }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // মেসেজ লোড
  useEffect(() => {
    loadMessages();
    socket?.emit('joinGroup', group._id);

    return () => {
      socket?.emit('leaveGroup', group._id);
    };
  }, [group]);

  // সকেট ইভেন্ট
  useEffect(() => {
    if (!socket) return;
    socket.on('receiveGroupMessage', (msg) => {
      if (msg.group === group._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off('receiveGroupMessage');
  }, [socket, group]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data } = await API.get(`/groups/${group._id}/messages`);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      socket?.emit('sendGroupMessage', {
        groupId: group._id,
        content: newMessage.trim(),
      }, (response) => {
        if (response?.error) toast.error(response.error);
      });
      setNewMessage('');
    } catch (error) {
      toast.error('মেসেজ পাঠানো যায়নি');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* হেডার */}
      <div className="flex items-center gap-3 p-3 border-b border-[#00F0FF]/10 bg-[#0F0F15]">
        <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white text-xl">←</button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF007F] to-[#FF007F]/50 
                        flex items-center justify-center text-white font-bold text-sm">
          👥
        </div>
        <div>
          <p className="text-gray-200 font-medium">{group.name}</p>
          <p className="text-xs text-gray-500">{group.members?.length} জন মেম্বার</p>
        </div>
      </div>

      {/* মেসেজ */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, i) => {
          const isMine = msg.sender?._id === user?._id;
          return (
            <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[80%] px-4 py-2.5 rounded-2xl text-sm
                ${isMine
                  ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#00F0FF]/10 border border-[#00F0FF]/30'
                  : 'bg-[#1A1A20] border border-[#FF007F]/20'
                }`}>
                {!isMine && (
                  <p className="text-[#FF007F] text-xs font-medium mb-1">{msg.sender?.name}</p>
                )}
                <p className="text-gray-200">{msg.content}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ইনপুট */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#00F0FF]/10 bg-[#0F0F15]">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="মেসেজ লিখো..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#1A1A20] border border-[#FF007F]/20 rounded-xl
                       text-gray-200 placeholder-gray-500 outline-none text-sm
                       focus:border-[#FF007F] focus:shadow-[0_0_12px_#FF007F] transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-3 bg-gradient-to-r from-[#FF007F] to-[#FF007F]/80 rounded-xl
                       text-black font-bold text-sm hover:shadow-[0_0_15px_#FF007F]
                       transition-all disabled:opacity-40"
          >
            📨
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat;
import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const ChatWindow = ({ selectedFriend, onBack, onShowProfile }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const isOnline = selectedFriend && onlineUsers.includes(selectedFriend._id);

  useEffect(() => {
    if (!selectedFriend) return;
    const loadMessages = async () => {
      try {
        const { data } = await API.get(`/messages/${selectedFriend._id}`);
        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadMessages();
  }, [selectedFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket || !selectedFriend) return;

    const handleReceiveMessage = (message) => {
      if (message.sender._id === selectedFriend._id || message.sender._id === user?._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = (data) => {
      if (data.userId === selectedFriend._id) {
        setTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
      }
    };

    const handleStopTyping = (data) => {
      if (data.userId === selectedFriend._id) {
        setTyping(false);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket, selectedFriend, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await API.post('/messages', {
        receiverId: selectedFriend._id,
        content: newMessage.trim(),
      });
      socket?.emit('sendMessage', {
        receiverId: selectedFriend._id,
        content: newMessage.trim(),
      }, (response) => {
        if (response.error) toast.error(response.error);
      });
      setNewMessage('');
      socket?.emit('stopTyping', { receiverId: selectedFriend._id });
      // Keep focus on input after sending
      inputRef.current?.focus();
    } catch (error) {
      toast.error('মেসেজ পাঠানো যায়নি');
    }
  };

  const handleTyping = () => {
    socket?.emit('typing', { receiverId: selectedFriend._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stopTyping', { receiverId: selectedFriend._id });
    }, 2000);
  };

  if (!selectedFriend) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-3xl font-bold text-[#00F0FF] mb-3">Mfa Chat</h2>
          <p className="text-gray-500">বন্ধু সিলেক্ট করো চ্যাট শুরু করতে</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* হেডার */}
      <div className="flex items-center gap-3 p-3 border-b border-[#00F0FF]/10 bg-[#0F0F15]">
        <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white text-xl">←</button>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00F0FF]/40 to-[#FF007F]/40 flex items-center justify-center text-white font-bold text-sm">
              {selectedFriend.name?.charAt(0)}
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0F0F15]"
                style={{ boxShadow: '0 0 6px #4ade80, 0 0 12px #4ade80' }}></span>
            )}
          </div>
          <div>
            <p className="text-gray-200 text-sm font-medium">{selectedFriend.name}</p>
            <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
              {typing ? 'টাইপ করছে...' : isOnline ? 'অনলাইন' : 'অফলাইন'}
            </p>
          </div>
        </div>
      </div>

      {/* মেসেজ */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#0B0B0F]">
        {messages.map((msg, i) => {
          const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
          return (
            <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm
                ${isMine ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#00F0FF]/10 border border-[#00F0FF]/30' : 'bg-[#1A1A20] border border-[#FF007F]/20'}`}>
                <p className="text-gray-200">{msg.content}</p>
                <p className="text-[10px] mt-1 text-gray-500">
                  {new Date(msg.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-[#1A1A20] px-4 py-2 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#FF007F] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#FF007F] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-2 h-2 bg-[#FF007F] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ইনপুট */}
      <form onSubmit={handleSend} className="p-2 bg-[#0F0F15] border-t border-[#00F0FF]/10 flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          autoFocus
          placeholder="মেসেজ লিখো..."
          value={newMessage}
          onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
          className="flex-1 px-4 py-3 bg-[#1A1A20] text-white placeholder-gray-400 text-sm rounded-xl border border-[#00F0FF]/20 outline-none focus:border-[#00F0FF]"
          style={{ fontSize: '16px' }}
        />
        <button type="submit" disabled={!newMessage.trim()} className="px-4 py-3 bg-[#00F0FF] text-black font-bold text-sm rounded-xl disabled:opacity-40">
          পাঠাও
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
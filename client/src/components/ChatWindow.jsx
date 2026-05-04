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

  const isOnline = selectedFriend && onlineUsers.includes(selectedFriend._id);

  // মেসেজ লোড
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

  // অটো স্ক্রল
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // সকেট ইভেন্ট
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

  // মেসেজ পাঠাও
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
        if (response.error) {
          toast.error(response.error);
        }
      });
      setNewMessage('');
      socket?.emit('stopTyping', { receiverId: selectedFriend._id });
    } catch (error) {
      toast.error('মেসেজ পাঠানো যায়নি');
    }
  };

  // টাইপিং ইন্ডিকেটর
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
          <h2 className="text-3xl md:text-5xl font-bold text-[#00F0FF] mb-3"
            style={{ textShadow: '0 0 15px #00F0FF, 0 0 40px #00F0FF' }}>
            Mfa Chat
          </h2>
          <p className="text-gray-500 text-sm md:text-base">বন্ধু সিলেক্ট করো চ্যাট শুরু করতে</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* চ্যাট হেডার */}
      <div className="flex-shrink-0 flex items-center gap-3 p-3 border-b border-[#00F0FF]/10 bg-[#0F0F15]">
        {/* মোবাইল ব্যাক বাটন */}
        <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white text-xl px-1">
          ←
        </button>

        <button
          onClick={onShowProfile}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#00F0FF]/40 to-[#FF007F]/40 
                            flex items-center justify-center text-white font-bold text-xs md:text-sm">
              {selectedFriend.name?.charAt(0)}
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-400 rounded-full 
                               border-2 border-[#0F0F15]"
                style={{ boxShadow: '0 0 6px #4ade80, 0 0 12px #4ade80' }}
              ></span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-gray-200 text-sm md:text-base font-medium truncate">{selectedFriend.name}</p>
            <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
              {typing ? 'টাইপ করছে...' : isOnline ? 'অনলাইন' : 'অফলাইন'}
            </p>
          </div>
        </button>
      </div>

      {/* মেসেজ লিস্ট */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-sm mt-10">কোনো মেসেজ নেই। মেসেজ পাঠানো শুরু করো!</p>
        )}
        {messages.map((msg, index) => {
          const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
          return (
            <div key={msg._id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] md:max-w-md px-4 py-2.5 rounded-2xl text-sm md:text-base
                ${isMine
                  ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-br-md'
                  : 'bg-[#1A1A20] border border-[#FF007F]/20 rounded-bl-md'
                }
              `}
                style={isMine
                  ? { boxShadow: '0 0 8px rgba(0,240,255,0.15)' }
                  : { boxShadow: '0 0 8px rgba(255,0,127,0.1)' }
                }
              >
                <p className="text-gray-200 break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-[#00F0FF]/60 text-right' : 'text-gray-600 text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-[#1A1A20] border border-[#FF007F]/20 px-4 py-2 rounded-2xl rounded-bl-md">
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

      {/* মেসেজ ইনপুট */}
      <form 
        onSubmit={handleSend} 
        className="flex-shrink-0 p-2 md:p-3 border-t border-[#00F0FF]/20 bg-[#0F0F15]"
      >
        <div className="flex gap-2 items-center">
          <input
            type="text"
            inputMode="text"
            enterKeyHint="send"
            placeholder="মেসেজ লিখো..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            autoComplete="off"
            className="flex-1 px-4 py-3.5 bg-[#1A1A20] border-2 border-[#00F0FF]/40 rounded-xl
                       text-white placeholder-gray-400 outline-none text-base
                       focus:border-[#00F0FF] focus:shadow-[0_0_15px_#00F0FF]
                       transition-all duration-300"
            style={{ fontSize: '16px' }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex-shrink-0 px-5 py-3.5 bg-gradient-to-r from-[#00F0FF] to-[#00F0FF]/80 rounded-xl
                       text-black font-bold text-sm hover:shadow-[0_0_15px_#00F0FF]
                       transition-all duration-300 disabled:opacity-30 active:scale-95
                       touch-manipulation select-none"
          >
            পাঠাও
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
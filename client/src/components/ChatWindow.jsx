import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

// ✅ নোটিফিকেশন ফাংশন
const showNotification = (message) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    new Notification('Mfa Chat - নতুন মেসেজ', {
      body: `${message.sender?.name || 'কেউ'}: ${message.content}`,
      icon: '/favicon.svg',
      tag: message._id,
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
};

const ChatWindow = ({ selectedFriend, onBack, onShowProfile }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const isOnline = selectedFriend && onlineUsers.includes(selectedFriend._id);

  useEffect(() => {
    if (!selectedFriend) return;
    loadMessages();
  }, [selectedFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket || !selectedFriend) return;

    const handleReceiveMessage = (msg) => {
      const isMyMessage = msg.sender._id === user?._id || msg.sender === user?._id;
      const isFromSelectedFriend = msg.sender._id === selectedFriend._id || msg.sender === selectedFriend._id;
      
      if (isMyMessage || isFromSelectedFriend) {
        setMessages((prev) => [...prev, msg]);
      }

      // ✅ নোটিফিকেশন (অন্য কেউ মেসেজ দিলে, চ্যাট খোলা না থাকলে)
      if (!isMyMessage) {
        showNotification(msg);
      }
    };

    const handleReaction = (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId ? { ...m, reaction: data.reaction } : m
        )
      );
    };

    const handleTyping = (data) => {
      if (data.userId === selectedFriend._id) {
        setTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
      }
    };

    const handleStopTyping = (data) => {
      if (data.userId === selectedFriend._id) setTyping(false);
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageReaction', handleReaction);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageReaction', handleReaction);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket, selectedFriend, user]);

  const loadMessages = async () => {
    try {
      const { data } = await API.get(`/messages/${selectedFriend._id}`);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

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
      });
      setNewMessage('');
      setShowEmoji(false);
      inputRef.current?.focus();
    } catch (error) {
      toast.error('মেসেজ পাঠানো যায়নি');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.emoji);
    inputRef.current?.focus();
  };

  const handleTyping = () => {
    socket?.emit('typing', { receiverId: selectedFriend._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('stopTyping', { receiverId: selectedFriend._id });
    }, 2000);
  };

  const handleReaction = (messageId) => {
    socket?.emit('reactMessage', { messageId, receiverId: selectedFriend._id, reaction: '❤️' });
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
    <div className="flex flex-col h-full w-full relative">
      {/* হেডার */}
      <div className="flex items-center gap-3 p-3 border-b border-[#00F0FF]/10 bg-[#0F0F15]">
        <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white text-xl flex-shrink-0">←</button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00F0FF]/40 to-[#FF007F]/40 flex items-center justify-center text-white font-bold text-sm">
              {selectedFriend.name?.charAt(0)}
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0F0F15]"
                style={{ boxShadow: '0 0 6px #4ade80, 0 0 12px #4ade80' }}></span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-gray-200 text-sm font-medium truncate">{selectedFriend.name}</p>
            <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
              {typing ? 'টাইপ করছে...' : isOnline ? 'অনলাইন' : 'অফলাইন'}
            </p>
          </div>
        </div>
        <button
          onClick={onShowProfile}
          className="md:hidden text-gray-400 hover:text-[#00F0FF] text-lg px-2 flex-shrink-0"
          title="প্রোফাইল"
        >
          ℹ️
        </button>
      </div>

      {/* মেসেজ */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0B0B0F]">
        {messages.map((msg, i) => {
          const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
          return (
            <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className="relative group">
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm
                  ${isMine ? 'bg-gradient-to-r from-[#00F0FF]/20 to-[#00F0FF]/10 border border-[#00F0FF]/30' : 'bg-[#1A1A20] border border-[#FF007F]/20'}`}>
                  <p className="text-gray-200">{msg.content}</p>
                  <p className="text-[10px] mt-1 text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => handleReaction(msg._id)}
                  className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                             bg-[#1A1A20] rounded-full px-2 py-0.5 text-xs border border-[#FF007F]/30 text-[#FF007F]"
                >
                  {msg.reaction || '❤️'}
                </button>
                {msg.reaction && (
                  <span className="absolute -bottom-4 right-0 text-lg">{msg.reaction}</span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ইমোজি পিকার */}
      {showEmoji && (
        <div className="absolute bottom-16 left-2 z-50">
          <EmojiPicker onEmojiClick={handleEmojiSelect} theme="dark" height={350} width={300} />
        </div>
      )}

      {/* ✅ মেসেজ ইনপুট - মোবাইল ফিক্স */}
      <form 
        onSubmit={handleSend} 
        className="flex-shrink-0 w-full p-2 border-t border-[#00F0FF]/20 bg-[#0F0F15]"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-2 items-center w-full max-w-full">
          {/* ইমোজি বাটন */}
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="flex-shrink-0 px-2 py-3 text-xl hover:bg-[#1A1A20] rounded-xl transition-colors"
          >
            😊
          </button>
          
          {/* ইনপুট */}
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            enterKeyHint="send"
            placeholder="মেসেজ লিখো..."
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            autoComplete="off"
            className="flex-1 min-w-0 px-3 py-3 bg-[#1A1A20] border-2 border-[#00F0FF]/40 rounded-xl
                       text-white placeholder-gray-400 outline-none text-base
                       focus:border-[#00F0FF] focus:shadow-[0_0_15px_#00F0FF]
                       transition-all duration-300"
            style={{ fontSize: '16px' }}
          />
          
          {/* পাঠাও বাটন */}
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-[#00F0FF] to-[#00F0FF]/80 rounded-xl
                       text-black font-bold text-sm hover:shadow-[0_0_15px_#00F0FF]
                       transition-all duration-300 disabled:opacity-30 active:scale-95
                       touch-manipulation select-none whitespace-nowrap"
          >
            পাঠাও
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
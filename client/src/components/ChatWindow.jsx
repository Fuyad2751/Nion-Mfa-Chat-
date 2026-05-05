import { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

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
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isOnline = selectedFriend && onlineUsers.includes(selectedFriend._id);

  useEffect(() => {
    if (!selectedFriend) return;
    loadMessages();
    inputRef.current?.focus();
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
      if (!isMyMessage) showNotification(msg);
    };
    socket.on('receiveMessage', handleReceiveMessage);
    return () => socket.off('receiveMessage', handleReceiveMessage);
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
      await API.post('/messages', { receiverId: selectedFriend._id, content: newMessage.trim() });
      socket?.emit('sendMessage', { receiverId: selectedFriend._id, content: newMessage.trim() });
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

  if (!selectedFriend) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#efeae2]">
        <div className="text-center px-4">
          <h2 className="text-2xl font-light text-gray-500 mb-2">Mfa Chat</h2>
          <p className="text-gray-400 text-sm">বন্ধু সিলেক্ট করো চ্যাট শুরু করতে</p>
        </div>
      </div>
    );
  }

  // মেসেজ গ্রুপিং (তারিখ অনুযায়ী)
  let lastDate = null;

  return (
    <div className="flex flex-col h-full w-full bg-[#e5ddd5]">
      {/* ✅ WhatsApp স্টাইল হেডার */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[#075e54] text-white">
        <button onClick={onBack} className="md:hidden text-white text-xl mr-1">←</button>
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            {selectedFriend.name?.charAt(0)}
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#075e54]"></span>
          )}
        </div>
        <div className="flex-1 min-w-0" onClick={onShowProfile}>
          <p className="text-white text-base font-medium truncate">{selectedFriend.name}</p>
          <p className="text-white/70 text-xs">
            {isOnline ? 'অনলাইন' : 'অফলাইন'}
          </p>
        </div>
        <button onClick={onShowProfile} className="text-white p-1">⋮</button>
      </div>

      {/* ✅ WhatsApp স্টাইল মেসেজ লিস্ট */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4cfc6\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
        
        {messages.map((msg, i) => {
          const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
          const msgDate = new Date(msg.createdAt).toLocaleDateString('bn-BD');
          const showDate = msgDate !== lastDate;
          lastDate = msgDate;

          return (
            <div key={msg._id || i}>
              {/* তারিখ দেখাও */}
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-lg text-xs text-gray-600 shadow-sm">
                    {msgDate}
                  </span>
                </div>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                <div className={`relative max-w-[80%] px-3 py-2 rounded-lg text-sm shadow-sm
                  ${isMine 
                    ? 'bg-[#dcf8c6] rounded-tr-none' 
                    : 'bg-white rounded-tl-none'
                  }`}>
                  <p className="text-gray-800 leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 flex items-center gap-1
                    ${isMine ? 'text-gray-500 justify-end' : 'text-gray-400 justify-start'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                    {isMine && <span className="text-blue-400">✓</span>}
                  </p>
                  {/* WhatsApp স্টাইল ট্রায়াঙ্গেল */}
                  <div className={`absolute top-0 w-0 h-0 border-solid
                    ${isMine 
                      ? '-right-2 border-t-[12px] border-t-[#dcf8c6] border-l-[12px] border-l-transparent' 
                      : '-left-2 border-t-[12px] border-t-white border-r-[12px] border-r-transparent'
                    }`}>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ইমোজি পিকার */}
      {showEmoji && (
        <div className="absolute bottom-14 left-2 z-50">
          <EmojiPicker onEmojiClick={handleEmojiSelect} theme="light" height={300} width={280} />
        </div>
      )}

      {/* ✅ WhatsApp স্টাইল ইনপুট */}
      <form onSubmit={handleSend} className="flex-shrink-0 bg-[#f0f0f0] px-2 py-1.5 flex gap-1.5 items-center border-t border-gray-300"
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
        
        <button type="button" onClick={() => setShowEmoji(!showEmoji)}
          className="p-2 text-gray-500 hover:text-gray-700 text-xl flex-shrink-0">😊</button>
        
        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="মেসেজ"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 outline-none text-sm bg-transparent text-gray-800 placeholder-gray-400"
            style={{ fontSize: '16px' }}
          />
        </div>

        {newMessage.trim() ? (
          <button type="submit" className="flex-shrink-0 w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/></svg>
          </button>
        ) : (
          <button type="button" className="flex-shrink-0 p-2 text-gray-500 text-xl">🎤</button>
        )}
      </form>
    </div>
  );
};

export default ChatWindow;
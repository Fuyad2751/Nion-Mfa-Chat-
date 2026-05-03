import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import FriendProfile from '../components/FriendProfile';
import ProfilePage from './ProfilePage';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);

  return (
    <div className="h-screen bg-[#0B0B0F] flex overflow-hidden">
      {/* সাইডবার - মোবাইলে টগল */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative absolute z-30 h-full w-full md:w-80 lg:w-96
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar
          user={user}
          onlineUsers={onlineUsers}
          selectedFriend={selectedFriend}
          onSelectFriend={(friend) => {
            setSelectedFriend(friend);
            setShowSidebar(false);
          }}
          onLogout={logout}
          onProfile={() => setShowProfilePage(true)}
        />
      </div>

      {/* মোবাইল ব্যাক বাটন ওভারলে */}
      {!showSidebar && selectedFriend && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setShowSidebar(true)}
        />
      )}

      {/* চ্যাট উইন্ডো */}
      <div className={`
        flex-1 flex flex-col
        ${showSidebar ? 'hidden md:flex' : 'flex'}
      `}>
        <ChatWindow
          selectedFriend={selectedFriend}
          onBack={() => setShowSidebar(true)}
          onShowProfile={() => setShowProfile(true)}
        />
      </div>

      {/* প্রোফাইল সাইডবার (ডেস্কটপে) */}
      {showProfile && selectedFriend && (
        <div className="hidden md:block w-80 border-l border-[#00F0FF]/20">
          <FriendProfile
            friend={selectedFriend}
            onClose={() => setShowProfile(false)}
            onlineUsers={onlineUsers}
          />
        </div>
      )}

      {/* প্রোফাইল পেজ (নিজের প্রোফাইল) */}
      {showProfilePage && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0F]">
          <ProfilePage onBack={() => setShowProfilePage(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
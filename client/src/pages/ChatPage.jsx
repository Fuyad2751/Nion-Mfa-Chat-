import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import GroupChat from '../components/GroupChat';
import FriendProfile from '../components/FriendProfile';
import ProfilePage from './ProfilePage';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);

  const handleSelectFriend = (friend) => {
    setSelectedGroup(null);
    setSelectedFriend(friend);
    setShowSidebar(false);
  };

  const handleSelectGroup = (group) => {
    setSelectedFriend(null);
    setSelectedGroup(group);
    setShowSidebar(false);
  };

  const handleBack = () => {
    setShowSidebar(true);
  };

  return (
    <div className="fixed inset-0 bg-[#0B0B0F] flex overflow-hidden">
      {/* সাইডবার */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative absolute z-30 h-full w-full md:w-80 lg:w-96
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar
          user={user}
          onlineUsers={onlineUsers}
          selectedFriend={selectedFriend}
          selectedGroup={selectedGroup}
          onSelectFriend={handleSelectFriend}
          onSelectGroup={handleSelectGroup}
          onLogout={logout}
          onProfile={() => setShowProfilePage(true)}
        />
      </div>

      {/* চ্যাট উইন্ডো */}
      {(selectedFriend || selectedGroup) && (
        <div className="fixed inset-0 z-20 md:relative md:z-auto flex flex-col bg-[#0B0B0F]">
          {selectedGroup ? (
            <GroupChat group={selectedGroup} onBack={handleBack} />
          ) : (
            <ChatWindow
              selectedFriend={selectedFriend}
              onBack={handleBack}
              onShowProfile={() => setShowProfile(true)}
            />
          )}
        </div>
      )}

      {/* ফ্রেন্ড প্রোফাইল (ডেস্কটপ) */}
      {showProfile && selectedFriend && (
        <div className="hidden md:block w-80 border-l border-[#00F0FF]/20">
          <FriendProfile
            friend={selectedFriend}
            onClose={() => setShowProfile(false)}
            onlineUsers={onlineUsers}
          />
        </div>
      )}

      {/* নিজের প্রোফাইল পেজ */}
      {showProfilePage && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0F]">
          <ProfilePage onBack={() => setShowProfilePage(false)} />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
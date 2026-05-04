import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import GuidePage from './pages/GuidePage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-2xl text-[#00F0FF] animate-pulse">Mfa Chat লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/chat" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/chat" />} />
      <Route path="/chat/*" element={user ? <ChatPage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/guide" />} />
    </Routes>
  );
}

export default App;
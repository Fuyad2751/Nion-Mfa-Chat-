import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;

    // ✅ লাইভ Render URL ব্যবহার করো
    const SOCKET_URL = 'https://mfa-chat-backend.onrender.com';

    const newSocket = io(SOCKET_URL, {
      auth: { token: user.token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
    });

    newSocket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
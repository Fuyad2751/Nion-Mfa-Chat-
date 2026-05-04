const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');               // ✅ নতুন
const { Server } = require('socket.io');   // ✅ নতুন
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB();

const app = express();

// সহজ CORS — সব URL-কে অনুমতি
app.use(cors({
  origin: '*',
  credentials: true,
}));

// টেস্ট রুট
app.get('/', (req, res) => {
  res.send('🚀 Mfa Chat API is running...');
});

// অথ রাউট
app.use('/api/auth', authRoutes);

const friendRoutes = require('./routes/friendRoutes');  // ✅ নতুন

const messageRoutes = require('./routes/messageRoutes');  // ✅ নতুন

// রাউটস
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);  // ✅ নতুন

// রাউটস
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);  // ✅ নতুন

const groupRoutes = require('./routes/groupRoutes');  // ✅ নতুন

// রাউটস
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);  // ✅ নতুন

// HTTP সার্ভার তৈরি ✅
const server = http.createServer(app);

// Socket.io সার্ভার ✅
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Socket.io লজিক ইম্পোর্ট ও চালু ✅
const initializeSocket = require('./socket');
initializeSocket(io);

// এরর হ্যান্ডলিং (ঐচ্ছিক)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'সার্ভার এরর' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {               // ✅ app.listen বদলে server.listen
  console.log(`✅ Server running on port ${PORT}`);
});
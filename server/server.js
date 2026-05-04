const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// রাউট ইম্পোর্ট
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');

// এনভায়রনমেন্ট ভেরিয়েবল লোড
dotenv.config();

// ডাটাবেস সংযোগ
connectDB();

const app = express();

// সহজ CORS — সব URL-কে অনুমতি
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// টেস্ট রুট
app.get('/', (req, res) => {
  res.send('🚀 Mfa Chat API is running...');
});

// API রাউটস
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// HTTP সার্ভার তৈরি
const server = http.createServer(app);

// Socket.io সার্ভার
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket.io লজিক ইম্পোর্ট ও চালু
const initializeSocket = require('./socket');
initializeSocket(io);

// এরর হ্যান্ডলিং
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'সার্ভার এরর' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
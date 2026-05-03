const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('টোকেন নেই'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('ইউজার খুঁজে পাওয়া যায়নি'));
    }

    socket.user = user;  // সকেটে ইউজার জুড়ে দেওয়া
    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    next(new Error('অনুমোদন ব্যর্থ'));
  }
};

module.exports = socketAuth;
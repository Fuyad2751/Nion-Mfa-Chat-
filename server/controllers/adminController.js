const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const FriendRequest = require('../models/FriendRequest');

// @desc   ড্যাশবোর্ড স্ট্যাট
// GET    /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalGroupMessages = await GroupMessage.countDocuments();
    const pendingRequests = await FriendRequest.countDocuments({ status: 'pending' });
    const onlineUsers = await User.countDocuments({ isOnline: true });

    // আজকের রেজিস্টার
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
    const todayMessages = await Message.countDocuments({ createdAt: { $gte: today } });

    res.json({
      totalUsers,
      totalMessages,
      totalGroups,
      totalGroupMessages,
      pendingRequests,
      onlineUsers,
      todayUsers,
      todayMessages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   সব ইউজার লিস্ট
// GET    /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email avatar friends createdAt')
      .sort({ createdAt: -1 });

    const usersWithStats = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      friendsCount: user.friends?.length || 0,
      createdAt: user.createdAt,
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   ইউজার ডিলিট
// DELETE /api/admin/users/:userId
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'ইউজার খুঁজে পাওয়া যায়নি' });

    // ইউজারের সব মেসেজ ডিলিট
    await Message.deleteMany({ $or: [{ sender: user._id }, { chatId: { $regex: user._id } }] });
    await GroupMessage.deleteMany({ sender: user._id });
    // ফ্রেন্ড রিকোয়েস্ট ডিলিট
    await FriendRequest.deleteMany({ $or: [{ sender: user._id }, { receiver: user._id }] });

    await User.findByIdAndDelete(user._id);
    res.json({ message: 'ইউজার সফলভাবে ডিলিট করা হয়েছে' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   অ্যাডমিন লগইন
// POST   /api/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // অ্যাডমিন চেক
    if (email !== 'admin@mfa.chat' || password !== 'admin123') {
      return res.status(401).json({ message: 'অ্যাডমিন অনুমোদন ব্যর্থ' });
    }

    res.json({
      message: 'অ্যাডমিন লগইন সফল',
      admin: { name: 'Super Admin', email: 'admin@mfa.chat' },
      token: 'admin-token-mfa-chat-2026',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

module.exports = { getDashboardStats, getAllUsers, deleteUser, adminLogin };
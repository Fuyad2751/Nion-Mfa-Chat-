const User = require('../models/User');
const generateToken = require('../config/generateToken');

// @desc   রেজিস্টার নতুন ইউজার
// route  POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'সব ফিল্ড পুরণ করো' });
    }

    // ইউজার আগে থেকেই আছে কিনা
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'ইউজার ইতিমধ্যে আছে' });
    }

    // নতুন ইউজার তৈরি
    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'অবৈধ ইউজার তথ্য' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   লগইন
// route  POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ইউজার খোঁজো (+password ফিল্ড আনতে হবে)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'ইমেইল বা পাসওয়ার্ড ভুল' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc   প্রোফাইল আপডেট (ছবি + নাম)
// PUT    /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'ইউজার খুঁজে পাওয়া যায়নি' });
    }

    // নাম আপডেট
    if (req.body.name) {
      user.name = req.body.name;
    }

    // ছবি আপলোড (যদি থাকে)
    if (req.file) {
      // পুরনো ছবি ক্লাউডিনারি থেকে ডিলিট (ঐচ্ছিক)
      if (user.avatar) {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`mfa-chat/${publicId}`);
        } catch (err) {
          console.log('পুরনো ছবি ডিলিট করতে ব্যর্থ:', err.message);
        }
      }

      // নতুন ছবি আপলোড
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'mfa-chat',
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'face',
      });

      user.avatar = result.secure_url;

      // লোকাল ফাইল ডিলিট
      fs.unlinkSync(req.file.path);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   প্রোফাইল দেখা
// GET    /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email avatar');
    if (!user) {
      return res.status(404).json({ message: 'ইউজার খুঁজে পাওয়া যায়নি' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

module.exports = { registerUser, loginUser, updateProfile, getProfile };
module.exports = { registerUser, loginUser, updateProfile, getProfile };
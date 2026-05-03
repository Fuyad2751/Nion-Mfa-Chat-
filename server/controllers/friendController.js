const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// @desc   ইউজার সার্চ (নাম বা ইমেইল দিয়ে)
// GET    /api/friends/search?q=abc
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q;
    if (!keyword) {
      return res.status(400).json({ message: 'সার্চ করার জন্য শব্দ দাও' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // নিজেকে বাদ দাও
        {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
          ],
        },
      ],
    }).select('name email avatar');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   ফ্রেন্ড রিকোয়েস্ট পাঠানো
// POST   /api/friends/request/:userId
const sendFriendRequest = async (req, res) => {
  try {
    const receiverId = req.params.userId;
    const senderId = req.user._id;

    if (receiverId === senderId.toString()) {
      return res.status(400).json({ message: 'নিজেকে ফ্রেন্ড রিকোয়েস্ট পাঠাতে পারবে না' });
    }

    // receiver আসলেই আছে কিনা
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'ইউজার খুঁজে পাওয়া যায়নি' });
    }

    // ইতিমধ্যে ফ্রেন্ড কিনা
    if (req.user.friends.includes(receiverId)) {
      return res.status(400).json({ message: 'ইতিমধ্যে ফ্রেন্ড' });
    }

    // ইতিমধ্যে রিকোয়েস্ট আছে কিনা
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ message: 'ইতিমধ্যে ফ্রেন্ড রিকোয়েস্ট পেন্ডিং আছে' });
      }
      // rejected থাকলে আবার সেন্ড করার অনুমতি - পুরনোটা ডিলিট করে নতুন
      await FriendRequest.findByIdAndDelete(existingRequest._id);
    }

    await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    res.status(201).json({ message: 'ফ্রেন্ড রিকোয়েস্ট পাঠানো হয়েছে' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   ফ্রেন্ড রিকোয়েস্ট অ্যাকসেপ্ট
// PUT    /api/friends/accept/:requestId
const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'রিকোয়েস্ট খুঁজে পাওয়া যায়নি' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'এই রিকোয়েস্ট অ্যাকসেপ্ট করার অনুমতি নেই' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'রিকোয়েস্ট ইতিমধ্যে নিষ্পত্তি হয়েছে' });
    }

    request.status = 'accepted';
    await request.save();

    // উভয়ের friends অ্যারেতে যোগ করো
    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.receiver },
    });
    await User.findByIdAndUpdate(request.receiver, {
      $addToSet: { friends: request.sender },
    });

    res.json({ message: 'ফ্রেন্ড রিকোয়েস্ট অ্যাকসেপ্ট করা হয়েছে' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   ফ্রেন্ড রিকোয়েস্ট রিজেক্ট
// PUT    /api/friends/reject/:requestId
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'রিকোয়েস্ট খুঁজে পাওয়া যায়নি' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'অনুমতি নেই' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'ফ্রেন্ড রিকোয়েস্ট রিজেক্ট করা হয়েছে' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   ফ্রেন্ড রিমুভ
// DELETE /api/friends/remove/:friendId
const removeFriend = async (req, res) => {
  try {
    const friendId = req.params.friendId;
    const userId = req.user._id;

    // উভয়ের ফ্রেন্ড লিস্ট থেকে সরাও
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    // সংশ্লিষ্ট ফ্রেন্ড রিকোয়েস্টও ডিলিট করো
    await FriendRequest.deleteMany({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    });

    res.json({ message: 'ফ্রেন্ড রিমুভ করা হয়েছে' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   পেন্ডিং রিকোয়েস্ট তালিকা (যেগুলো তুমি পেয়েছো)
// GET    /api/friends/requests
const getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: 'pending',
    }).populate('sender', 'name email avatar');

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   ফ্রেন্ড লিস্ট
// GET    /api/friends
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'friends',
      'name email avatar'
    );
    res.json(user.friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

module.exports = {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getPendingRequests,
  getFriends,
};
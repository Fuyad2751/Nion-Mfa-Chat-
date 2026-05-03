const Message = require('../models/Message');
const User = require('../models/User');

// @desc   দুই ইউজারের চ্যাট আইডি জেনারেটর (সর্টেড আইডি)
const generateChatId = (id1, id2) => {
  return [id1, id2].sort().join('_');
};

// @desc   মেসেজ পাঠানো
// POST   /api/messages
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id.toString();

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'receiverId এবং content আবশ্যক' });
    }

    if (receiverId === senderId) {
      return res.status(400).json({ message: 'নিজেকে মেসেজ পাঠাতে পারবে না' });
    }

    // চেক করো receiver আছে কিনা
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'প্রাপক খুঁজে পাওয়া যায়নি' });
    }

    // চেক করো তারা বন্ধু কিনা
    if (!req.user.friends.includes(receiverId)) {
      return res.status(403).json({ message: 'শুধু বন্ধুদের মেসেজ পাঠাতে পারবে' });
    }

    const chatId = generateChatId(senderId, receiverId);

    const message = await Message.create({
      chatId,
      sender: senderId,
      content,
    });

    // জনবহুল মেসেজ রেসপন্স
    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name email avatar'
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   চ্যাট হিস্ট্রি পাওয়া
// GET    /api/messages/:friendId
const getMessages = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id.toString();

    const chatId = generateChatId(userId, friendId);

    const messages = await Message.find({ chatId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 }) // পুরনো আগে
      .limit(100); // সর্বোচ্চ ১০০ মেসেজ একবারে

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   চ্যাট লিস্ট (যাদের সাথে চ্যাট হয়েছে)
// GET    /api/messages/chatlist
const getChatList = async (req, res) => {
  try {
    const userId = req.user._id;

    // সব চ্যাটের শেষ মেসেজ খুঁজে বের করো
    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { chatId: { $regex: userId.toString() } }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$chatId',
          lastMessage: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$lastMessage' },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // চ্যাট আইডি থেকে বন্ধুর আইডি বের করে ইউজার ইনফো যোগ করো
    const chatList = await Promise.all(
      chats.map(async (chat) => {
        const ids = chat.chatId.split('_');
        const friendId = ids[0] === userId.toString() ? ids[1] : ids[0];
        const friend = await User.findById(friendId).select('name email avatar');
        return {
          chatId: chat.chatId,
          friend,
          lastMessage: chat.content,
          timestamp: chat.createdAt,
        };
      })
    );

    res.json(chatList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

module.exports = { sendMessage, getMessages, getChatList };
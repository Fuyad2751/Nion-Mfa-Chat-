const socketAuth = require('../middleware/socketAuth');
const Message = require('../models/Message');
const GroupMessage = require('../models/GroupMessage');
const Group = require('../models/Group');

// অনলাইন ইউজারদের ম্যাপ: userId -> socketId
const onlineUsers = new Map();

// চ্যাট আইডি জেনারেটর (পার্সোনাল চ্যাটের জন্য)
const generateChatId = (id1, id2) => {
  return [id1, id2].sort().join('_');
};

const initializeSocket = (io) => {
  // অথ মিডলওয়্যার (প্রতি সংযোগে)
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🟢 ${user.name} (${user.email}) অনলাইন হয়েছে`);

    // ইউজারকে অনলাইন তালিকায় যোগ
    onlineUsers.set(user._id.toString(), socket.id);

    // সব ক্লায়েন্টকে হালনাগাদ তালিকা পাঠাও
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    // ✅ ব্যক্তিগত রুমে জয়েন করো (নিজের আইডির রুম)
    socket.join(user._id.toString());

    // ============ পার্সোনাল চ্যাট ============

    // ✅ মেসেজ পাঠানো ইভেন্ট
    socket.on('sendMessage', async (data, callback) => {
      try {
        const { receiverId, content } = data;
        const senderId = user._id.toString();

        if (!receiverId || !content) {
          return callback({ error: 'receiverId এবং content আবশ্যক' });
        }

        const chatId = generateChatId(senderId, receiverId);

        const message = await Message.create({
          chatId,
          sender: senderId,
          content,
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name email avatar'
        );

        // প্রাপকের ইউজার রুমে মেসেজ এমিট করো
        io.to(receiverId).emit('receiveMessage', populatedMessage);

        // প্রেরকের নিজের কাছেও ইকো
        socket.emit('receiveMessage', populatedMessage);

        callback({ success: true, message: populatedMessage });
      } catch (error) {
        console.error('sendMessage error:', error);
        callback({ error: 'মেসেজ পাঠাতে ব্যর্থ' });
      }
    });

    // ✅ টাইপিং ইন্ডিকেটর
    socket.on('typing', ({ receiverId }) => {
      socket.to(receiverId).emit('typing', { userId: user._id.toString(), name: user.name });
    });

    socket.on('stopTyping', ({ receiverId }) => {
      socket.to(receiverId).emit('stopTyping', { userId: user._id.toString() });
    });

    // ============ গ্রুপ চ্যাট ============

    // ✅ গ্রুপ রুমে জয়েন
    socket.on('joinGroup', (groupId) => {
      socket.join(`group_${groupId}`);
      console.log(`${user.name} গ্রুপে জয়েন করেছে: ${groupId}`);
    });

    // ✅ গ্রুপ রুম ছাড়া
    socket.on('leaveGroup', (groupId) => {
      socket.leave(`group_${groupId}`);
      console.log(`${user.name} গ্রুপ ছেড়েছে: ${groupId}`);
    });

    // ✅ গ্রুপ মেসেজ পাঠানো
    socket.on('sendGroupMessage', async (data, callback) => {
      try {
        const { groupId, content } = data;

        if (!groupId || !content) {
          return callback({ error: 'groupId এবং content আবশ্যক' });
        }

        // গ্রুপ ও মেম্বারশিপ চেক
        const group = await Group.findById(groupId);
        if (!group) {
          return callback({ error: 'গ্রুপ খুঁজে পাওয়া যায়নি' });
        }

        if (!group.members.includes(user._id)) {
          return callback({ error: 'তুমি এই গ্রুপের মেম্বার না' });
        }

        const message = await GroupMessage.create({
          group: groupId,
          sender: user._id,
          content,
        });

        const populatedMessage = await GroupMessage.findById(message._id)
          .populate('sender', 'name email avatar');

        // গ্রুপ রুমে ব্রডকাস্ট (সবার কাছে)
        io.to(`group_${groupId}`).emit('receiveGroupMessage', populatedMessage);

        callback({ success: true, message: populatedMessage });
      } catch (error) {
        console.error('sendGroupMessage error:', error);
        callback({ error: 'গ্রুপ মেসেজ পাঠাতে ব্যর্থ' });
      }
    });

    // ============ ডিসকানেক্ট ============

    socket.on('disconnect', () => {
      console.log(`🔴 ${user.name} অফলাইন হয়েছে`);
      onlineUsers.delete(user._id.toString());
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = initializeSocket;
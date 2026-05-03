const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');

// @desc   গ্রুপ তৈরি
// POST   /api/groups
const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'গ্রুপের নাম দাও' });
    }

    if (!members || members.length < 1) {
      return res.status(400).json({ message: 'কমপক্ষে একজন মেম্বার অ্যাড করো' });
    }

    // নিজেকে সহ সব মেম্বার
    const allMembers = [req.user._id, ...members];

    const group = await Group.create({
      name,
      creator: req.user._id,
      members: allMembers,
      admins: [req.user._id],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email avatar')
      .populate('admins', 'name email avatar')
      .populate('creator', 'name email avatar');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   ইউজারের সব গ্রুপ
// GET    /api/groups
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email avatar')
      .populate('admins', 'name email avatar')
      .populate('creator', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   গ্রুপ ডিটেইলস
// GET    /api/groups/:groupId
const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', 'name email avatar')
      .populate('admins', 'name email avatar')
      .populate('creator', 'name email avatar');

    if (!group) {
      return res.status(404).json({ message: 'গ্রুপ খুঁজে পাওয়া যায়নি' });
    }

    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   গ্রুপে মেম্বার অ্যাড
// PUT    /api/groups/:groupId/add-members
const addMembers = async (req, res) => {
  try {
    const { members } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'গ্রুপ খুঁজে পাওয়া যায়নি' });
    }

    // নতুন মেম্বার অ্যাড (ডুপ্লিকেট বাদ)
    const newMembers = members.filter(
      (m) => !group.members.includes(m)
    );
    group.members.push(...newMembers);
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate('members', 'name email avatar')
      .populate('admins', 'name email avatar');

    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   গ্রুপে মেসেজ পাঠানো
// POST   /api/groups/:groupId/messages
const sendGroupMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { groupId } = req.params;

    if (!content) {
      return res.status(400).json({ message: 'মেসেজ লিখো' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'গ্রুপ খুঁজে পাওয়া যায়নি' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'তুমি এই গ্রুপের মেম্বার না' });
    }

    const message = await GroupMessage.create({
      group: groupId,
      sender: req.user._id,
      content,
    });

    const populatedMessage = await GroupMessage.findById(message._id)
      .populate('sender', 'name email avatar');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

// @desc   গ্রুপ মেসেজ হিস্ট্রি
// GET    /api/groups/:groupId/messages
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await GroupMessage.find({ group: groupId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'সার্ভার সমস্যা' });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupDetails,
  addMembers,
  sendGroupMessage,
  getGroupMessages,
};
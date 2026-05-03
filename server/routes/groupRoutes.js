const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createGroup,
  getGroups,
  getGroupDetails,
  addMembers,
  sendGroupMessage,
  getGroupMessages,
} = require('../controllers/groupController');

router.use(protect);

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:groupId', getGroupDetails);
router.put('/:groupId/add-members', addMembers);
router.post('/:groupId/messages', sendGroupMessage);
router.get('/:groupId/messages', getGroupMessages);

module.exports = router;
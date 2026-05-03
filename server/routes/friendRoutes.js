const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getPendingRequests,
  getFriends,
} = require('../controllers/friendController');

// সব রুট প্রোটেক্টেড
router.use(protect);

router.get('/search', searchUsers);
router.get('/requests', getPendingRequests);
router.get('/', getFriends);
router.post('/request/:userId', sendFriendRequest);
router.put('/accept/:requestId', acceptFriendRequest);
router.put('/reject/:requestId', rejectFriendRequest);
router.delete('/remove/:friendId', removeFriend);

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendMessage, getMessages, getChatList } = require('../controllers/messageController');

router.use(protect);

router.post('/', sendMessage);
router.get('/chatlist', getChatList);
router.get('/:friendId', getMessages);

module.exports = router;
const express = require('express');
const { registerUser, loginUser, updateProfile, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
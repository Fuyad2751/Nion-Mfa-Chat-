const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, deleteUser, adminLogin } = require('../controllers/adminController');

router.post('/login', adminLogin);
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);

module.exports = router;
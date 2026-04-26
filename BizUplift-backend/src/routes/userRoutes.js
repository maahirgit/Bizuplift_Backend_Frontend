const express = require('express');
const router = express.Router();
const { getUser, getProfile, updateUser, updateProfile, getAllUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAllUsers);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);

module.exports = router;

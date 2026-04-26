const express = require('express');
const router = express.Router();
const { register, login, loginWithOTP, loginWithGoogle, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/login-otp', loginWithOTP);
router.post('/google', loginWithGoogle);
router.get('/me', protect, getMe);

module.exports = router;

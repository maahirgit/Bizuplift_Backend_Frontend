const express = require('express');
const router = express.Router();
const { getMyCredits, addCredits, redeemCredits } = require('../controllers/creditController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMyCredits);
router.post('/add', protect, addCredits);
router.post('/redeem', protect, redeemCredits);

module.exports = router;

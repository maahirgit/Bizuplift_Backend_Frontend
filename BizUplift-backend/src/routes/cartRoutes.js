const express = require('express');
const router = express.Router();
const { getCart, addItem, updateItem, removeItem, clearCart, applyCoupon } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/add', protect, addItem);
router.post('/coupon', protect, applyCoupon);
router.put('/item/:itemId', protect, updateItem);
router.delete('/item/:itemId', protect, removeItem);
router.delete('/clear', protect, clearCart);

module.exports = router;

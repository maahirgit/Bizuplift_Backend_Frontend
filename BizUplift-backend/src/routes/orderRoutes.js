const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, createOrder);
router.post('/razorpay', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpayPayment);
router.put('/:id/status', protect, authorize('seller', 'admin'), updateOrderStatus);

module.exports = router;

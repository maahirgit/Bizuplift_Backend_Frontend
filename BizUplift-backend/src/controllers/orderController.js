/**
 * controllers/orderController.js
 * Place orders, view orders, update status.
 */
const Order = require('../models/Order');
const CreditLedger = require('../models/CreditLedger');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper: add credits
const awardCredits = async (userId, points, action) => {
    let ledger = await CreditLedger.findOne({ userId });
    if (!ledger) ledger = new CreditLedger({ userId, balance: 0, transactions: [] });
    const newBalance = ledger.balance + points;
    ledger.balance = newBalance;
    ledger.transactions.unshift({ action, points, type: 'earn', balance: newBalance });
    await ledger.save();
    await User.findByIdAndUpdate(userId, { credits: newBalance });
};

const getOrders = async (req, res, next) => {
    try {
        let orders;
        if (req.user.role === 'admin') {
            orders = await Order.find().sort('-createdAt').populate('customerId', 'name email');
        } else if (req.user.role === 'seller') {
            // Find all products owned by this seller
            const Product = require('../models/Product');
            const sellerProducts = await Product.find({ sellerId: req.user.sellerId || req.user._id }).select('_id');
            const productIds = sellerProducts.map(p => p._id);
            
            // Find orders where customer is user OR order contains seller's products
            orders = await Order.find({
                $or: [
                    { customerId: req.user._id },
                    { 'items.productId': { $in: productIds } }
                ]
            }).sort('-createdAt').populate('customerId', 'name email');
        } else {
            orders = await Order.find({ customerId: req.user._id }).sort('-createdAt');
        }
        res.json({ success: true, count: orders.length, orders });
    } catch (err) { next(err); }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('customerId', 'name email');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        // Only the customer, seller of items, or admin can view
        if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' });
        res.json({ success: true, order });
    } catch (err) { next(err); }
};

// POST /api/orders
const createOrder = async (req, res, next) => {
    try {
        const { items, total, paymentMethod, address } = req.body;
        if (!items || !items.length || !total || !address)
            return res.status(400).json({ success: false, message: 'items, total and address are required' });

        const creditsEarned = Math.floor(total / 10);
        const platformFee = total * 0.02;

        const order = await Order.create({
            customerId: req.user._id,
            items,
            total,
            paymentMethod: paymentMethod || 'COD',
            address,
            creditsEarned,
            platformFee,
        });

        // Award loyalty credits
        await awardCredits(req.user._id, creditsEarned, 'Purchase Reward');

        res.status(201).json({ success: true, order });
    } catch (err) { next(err); }
};

// PUT /api/orders/:id/status  (seller or admin)
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

        const updateData = { status };
        if (status === 'Delivered') updateData.deliveredAt = new Date();

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        res.json({ success: true, order });
    } catch (err) { next(err); }
};

// ─── Razorpay Integration ─────────────────────────────────────

// POST /api/orders/razorpay — Create a Razorpay order
const createRazorpayOrder = async (req, res, next) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);
        res.json({ success: true, razorpayOrder });
    } catch (err) { next(err); }
};

// POST /api/orders/verify — Verify Razorpay payment signature
const verifyRazorpayPayment = async (req, res, next) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderDetails // Contains items, address, total, etc.
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment verified, now create the actual order in DB
            const { items, total, address, paymentMethod } = orderDetails;
            const creditsEarned = Math.floor(total / 10);
            const platformFee = total * 0.02;

            const order = await Order.create({
                customerId: req.user._id,
                items,
                total,
                paymentMethod: paymentMethod || 'Card',
                address,
                creditsEarned,
                platformFee,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                isPaid: true,
                paidAt: new Date(),
                status: 'Confirmed'
            });

            // Award loyalty credits
            await awardCredits(req.user._id, creditsEarned, `Earned from Order ${order._id}`);

            res.json({ success: true, message: 'Payment verified successfully', order });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) { next(err); }
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, createRazorpayOrder, verifyRazorpayPayment };

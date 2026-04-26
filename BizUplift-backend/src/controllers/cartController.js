/**
 * controllers/cartController.js
 * Full cart management: get, add item, update qty, remove item, clear, apply coupon.
 */
const Cart = require('../models/Cart');

const COUPONS = { HOLI20: 20, DIWALI15: 15, NEWUSER10: 10, BIZUPLIFT: 5 };

// GET /api/cart  (protected)
const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId', 'name images price stock');
        res.json({ success: true, cart: cart || { items: [], appliedCredits: 0, couponCode: '', couponDiscount: 0 } });
    } catch (err) { next(err); }
};

// POST /api/cart/add  (protected)
// body: { productId, name, image, sellerId, sellerName, price, quantity, negotiatedPrice }
const addItem = async (req, res, next) => {
    try {
        const { productId, name, image, sellerId, sellerName, originalPrice, negotiatedPrice, price, quantity = 1 } = req.body;
        if (!productId || !price) return res.status(400).json({ success: false, message: 'productId and price required' });

        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) cart = new Cart({ userId: req.user._id, items: [] });

        const existing = cart.items.find(i => i.productId.toString() === productId && i.negotiatedPrice === (negotiatedPrice || null));
        if (existing) {
            existing.quantity += Number(quantity);
        } else {
            cart.items.push({ productId, name, image: image || '', sellerId, sellerName: sellerName || '', originalPrice: originalPrice || price, negotiatedPrice: negotiatedPrice || null, price, quantity, isNegotiated: !!negotiatedPrice });
        }
        await cart.save();
        res.json({ success: true, cart });
    } catch (err) { next(err); }
};

// PUT /api/cart/item/:itemId  (protected)
const updateItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        if (Number(quantity) < 1) {
            item.deleteOne();
        } else {
            item.quantity = Number(quantity);
        }
        await cart.save();
        res.json({ success: true, cart });
    } catch (err) { next(err); }
};

// DELETE /api/cart/item/:itemId  (protected)
const removeItem = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
        cart.items.id(req.params.itemId)?.deleteOne();
        await cart.save();
        res.json({ success: true, cart });
    } catch (err) { next(err); }
};

// DELETE /api/cart/clear  (protected)
const clearCart = async (req, res, next) => {
    try {
        await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [], appliedCredits: 0, couponCode: '', couponDiscount: 0 });
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) { next(err); }
};

// POST /api/cart/coupon  (protected)
const applyCoupon = async (req, res, next) => {
    try {
        const { code } = req.body;
        const upperCode = code?.toUpperCase();
        const discount = COUPONS[upperCode];
        if (!discount) return res.status(400).json({ success: false, message: 'Invalid coupon code' });

        const festivalDates = {
            'HOLI': new Date(new Date().getFullYear(), 2, 3), // March 3
            'DIWALI': new Date(new Date().getFullYear(), 10, 8) // Nov 8
        };
        
        let festDate = null;
        if (upperCode.startsWith('HOLI')) festDate = festivalDates['HOLI'];
        else if (upperCode.startsWith('DIWALI')) festDate = festivalDates['DIWALI'];
        
        if (festDate) {
            const now = new Date();
            const diffTime = Math.abs(now - festDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 5) {
                return res.status(400).json({ success: false, message: 'This festival coupon is only valid within 5 days of the festival date.' });
            }
        }

        if (upperCode === 'NEWUSER10') {
            const Order = require('../models/Order');
            const orderCount = await Order.countDocuments({ customerId: req.user._id });
            if (orderCount > 0) {
                return res.status(400).json({ success: false, message: 'NEWUSER10 is only valid for your first order.' });
            }
        }

        await Cart.findOneAndUpdate({ userId: req.user._id }, { couponCode: upperCode, couponDiscount: discount });
        res.json({ success: true, code: upperCode, discount });
    } catch (err) { next(err); }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, applyCoupon };

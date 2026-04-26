/**
 * controllers/reviewController.js
 * Add reviews and get reviews by product.
 */
const Review = require('../models/Review');
const Product = require('../models/Product');
const CreditLedger = require('../models/CreditLedger');
const User = require('../models/User');

// GET /api/reviews/product/:productId
const getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort('-createdAt');
        res.json({ success: true, count: reviews.length, reviews });
    } catch (err) { next(err); }
};

// POST /api/reviews  (protected)
const addReview = async (req, res, next) => {
    try {
        const { productId, rating, title, body } = req.body;
        if (!productId || !rating)
            return res.status(400).json({ success: false, message: 'productId and rating are required' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const review = await Review.create({
            productId,
            userId: req.user._id,
            userName: req.user.name,
            rating,
            title: title || '',
            body: body || '',
        });

        // Recalculate product rating average
        const allReviews = await Review.find({ productId });
        const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
        await Product.findByIdAndUpdate(productId, { rating: Math.round(avg * 10) / 10, reviews: allReviews.length });

        // Award 50 credits for writing a review
        let ledger = await CreditLedger.findOne({ userId: req.user._id });
        if (!ledger) ledger = new CreditLedger({ userId: req.user._id, balance: 0, transactions: [] });
        const newBalance = ledger.balance + 50;
        ledger.balance = newBalance;
        ledger.transactions.unshift({ action: 'Review Written', points: 50, type: 'earn', balance: newBalance });
        await ledger.save();
        await User.findByIdAndUpdate(req.user._id, { credits: newBalance });

        res.status(201).json({ success: true, review });
    } catch (err) { next(err); }
};

module.exports = { getProductReviews, addReview };

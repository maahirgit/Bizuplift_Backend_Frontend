/**
 * controllers/negotiationController.js
 * Save and retrieve negotiation sessions per user+product.
 */
const Negotiation = require('../models/Negotiation');

// GET /api/negotiations/:productId  (protected)
const getNegotiation = async (req, res, next) => {
    try {
        const negotiation = await Negotiation.findOne({
            productId: req.params.productId,
            userId: req.user._id,
        });
        if (!negotiation) return res.status(404).json({ success: false, message: 'No negotiation found' });
        res.json({ success: true, negotiation });
    } catch (err) { next(err); }
};

// POST /api/negotiations  (protected) — upsert
const saveNegotiation = async (req, res, next) => {
    try {
        const { productId, messages, finalPrice, status } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

        const negotiation = await Negotiation.findOneAndUpdate(
            { productId, userId: req.user._id },
            { messages, finalPrice, status },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json({ success: true, negotiation });
    } catch (err) { next(err); }
};

module.exports = { getNegotiation, saveNegotiation };

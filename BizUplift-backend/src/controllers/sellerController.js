/**
 * controllers/sellerController.js
 * CRUD for seller profiles.
 */
const Seller = require('../models/Seller');
const User = require('../models/User');

// GET /api/sellers
const getSellers = async (req, res, next) => {
    try {
        const { category, verified } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (verified !== undefined) filter.verified = verified === 'true';

        const sellers = await Seller.find(filter).sort({ rating: -1 });
        res.json({ success: true, count: sellers.length, sellers });
    } catch (err) { next(err); }
};

// GET /api/sellers/:id
const getSeller = async (req, res, next) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
        res.json({ success: true, seller });
    } catch (err) { next(err); }
};

// POST /api/sellers  (protected — customer creating seller profile)
const createSeller = async (req, res, next) => {
    try {
        const seller = await Seller.create({ ...req.body, userId: req.user._id });
        // Link seller id to the user document and upgrade role
        await User.findByIdAndUpdate(req.user._id, { sellerId: seller._id, role: 'seller' });
        res.status(201).json({ success: true, seller });
    } catch (err) { next(err); }
};

// PUT /api/sellers/:id  (protected — own seller or admin)
const updateSeller = async (req, res, next) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
        if (seller.userId?.toString() !== req.user._id.toString() && req.user.role !== 'admin')
            return res.status(403).json({ success: false, message: 'Not authorized' });

        const updated = await Seller.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, seller: updated });
    } catch (err) { next(err); }
};

module.exports = { getSellers, getSeller, createSeller, updateSeller };

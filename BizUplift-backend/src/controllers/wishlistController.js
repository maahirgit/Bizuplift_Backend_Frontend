/**
 * controllers/wishlistController.js
 * Get and toggle wishlist for authenticated user.
 */
const Wishlist = require('../models/Wishlist');

// GET /api/wishlist  (protected)
const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('productIds');
        res.json({ success: true, products: wishlist ? wishlist.productIds : [] });
    } catch (err) { next(err); }
};

// POST /api/wishlist/toggle  (protected)
// body: { productId }
const toggleWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

        const wishlist = await Wishlist.findOne({ userId: req.user._id });
        const exists = wishlist ? wishlist.productIds.includes(productId) : false;

        const update = exists 
            ? { $pull: { productIds: productId } }
            : { $addToSet: { productIds: productId } };

        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { userId: req.user._id },
            update,
            { new: true, upsert: true }
        );

        res.json({ 
            success: true, 
            wishlisted: !exists, 
            productIds: updatedWishlist.productIds 
        });
    } catch (err) { next(err); }
};

module.exports = { getWishlist, toggleWishlist };

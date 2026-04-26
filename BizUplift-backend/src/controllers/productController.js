/**
 * controllers/productController.js
 * Full CRUD for products with filtering, search, pagination.
 */
const Product = require('../models/Product');
const Seller = require('../models/Seller');

// GET /api/products
// Query params: festival, category, sellerId, search, featured, page, limit, sort
const getProducts = async (req, res, next) => {
    try {
        const { festival, category, sellerId, search, featured, page = 1, limit = 100, sort = '-createdAt' } = req.query;
        const filter = {};

        if (festival && festival !== 'All') filter.festival = festival;
        if (category) filter.category = category;
        if (sellerId) filter.sellerId = sellerId;
        if (featured === 'true') filter.featured = true;
        if (search) filter.$text = { $search: search };

        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([
            Product.find(filter).sort(sort).skip(skip).limit(Number(limit)).populate('sellerId', 'name business city'),
            Product.countDocuments(filter),
        ]);

        res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), products });
    } catch (err) { next(err); }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('sellerId', 'name business city state rating avatar');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product });
    } catch (err) { next(err); }
};

// POST /api/products  (seller + admin)
const createProduct = async (req, res, next) => {
    try {
        // Attach sellerId from logged-in user if seller
        if (req.user.role === 'seller' && !req.body.sellerId) {
            req.body.sellerId = req.user.sellerId;
        }
        const product = await Product.create(req.body);
        // Increment seller product count
        await Seller.findByIdAndUpdate(product.sellerId, { $inc: { products: 1 } });
        res.status(201).json({ success: true, product });
    } catch (err) { next(err); }
};

// PUT /api/products/:id  (seller owner or admin)
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Sellers can only update their own products
        if (req.user.role === 'seller' && product.sellerId.toString() !== req.user.sellerId?.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' });

        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, product: updated });
    } catch (err) { next(err); }
};

// DELETE /api/products/:id  (seller owner or admin)
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (req.user.role === 'seller' && product.sellerId.toString() !== req.user.sellerId?.toString())
            return res.status(403).json({ success: false, message: 'Not authorized' });

        await product.deleteOne();
        await Seller.findByIdAndUpdate(product.sellerId, { $inc: { products: -1 } });
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) { next(err); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };

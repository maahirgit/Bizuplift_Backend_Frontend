/**
 * models/Product.js — Product / item listing schema
 */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sellerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    sellerName:  { type: String, required: true },
    festival:    { type: String, default: 'All' },
    category:    { type: String, required: true },
    images:      [{ type: String }],
    mrp:         { type: Number, required: true, min: 0 },
    price:       { type: Number, required: true, min: 0 },
    minPrice:    { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    stock:       { type: Number, default: 0, min: 0 },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    reviews:     { type: Number, default: 0 }, // review count cache
    negotiable:  { type: Boolean, default: false },
    tags:        [{ type: String }],
    featured:    { type: Boolean, default: false },
}, { timestamps: true });

// Full-text search index on name, description, tags
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);

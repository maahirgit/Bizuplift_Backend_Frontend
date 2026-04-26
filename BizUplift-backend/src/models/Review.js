/**
 * models/Review.js — Product review schema
 */
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName:  { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    title:     { type: String, default: '' },
    body:      { type: String, default: '' },
    helpful:   { type: Number, default: 0 },
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

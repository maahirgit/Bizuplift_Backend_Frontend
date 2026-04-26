/**
 * models/Seller.js — Seller / artisan profile schema
 */
const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    year:  { type: String },
    event: { type: String },
}, { _id: false });

const sellerSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    business:    { type: String, required: true, trim: true },
    category:    { type: String, required: true },
    city:        { type: String, required: true },
    state:       { type: String, required: true },
    story:       { type: String, default: '' },
    tagline:     { type: String, default: '' },
    avatar:      { type: String, default: '' },
    cover:       { type: String, default: null },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    totalOrders: { type: Number, default: 0 },
    verified:    { type: Boolean, default: false },
    festivals:   [{ type: String }],
    joinedAt:    { type: String, default: () => new Date().toISOString().split('T')[0] },
    products:    { type: Number, default: 0 },
    milestones:  [milestoneSchema],
    // back-reference to user account
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Seller', sellerSchema);

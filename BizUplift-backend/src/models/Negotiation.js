/**
 * models/Negotiation.js — Price negotiation session schema
 */
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender:  { type: String, enum: ['buyer', 'seller'], required: true },
    text:    { type: String, required: true },
    price:   { type: Number, default: null },
    sentAt:  { type: Date, default: Date.now },
}, { _id: false });

const negotiationSchema = new mongoose.Schema({
    productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages:   [messageSchema],
    finalPrice: { type: Number, default: null },
    status:     { type: String, enum: ['active', 'agreed', 'rejected'], default: 'active' },
}, { timestamps: true });

// Unique negotiation per user per product
negotiationSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Negotiation', negotiationSchema);

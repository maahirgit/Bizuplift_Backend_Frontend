/**
 * models/Cart.js — User cart schema
 */
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:            { type: String, required: true },
    image:           { type: String, default: '' },
    sellerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    sellerName:      { type: String, default: '' },
    originalPrice:   { type: Number, required: true },
    negotiatedPrice: { type: Number, default: null },
    price:           { type: Number, required: true },
    quantity:        { type: Number, default: 1, min: 1 },
    isNegotiated:    { type: Boolean, default: false },
}, { _id: true });

const cartSchema = new mongoose.Schema({
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items:          [cartItemSchema],
    appliedCredits: { type: Number, default: 0 },
    couponCode:     { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);

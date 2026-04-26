/**
 * models/Order.js — Customer order schema
 */
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name:      { type: String, required: true },
    image:     { type: String, default: '' },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
}, { _id: false });

const addressSchema = new mongoose.Schema({
    name:    { type: String, required: true },
    line1:   { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    phone:   { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:         [orderItemSchema],
    total:         { type: Number, required: true },
    status:        {
        type: String,
        enum: ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Return Rejected'],
        default: 'Processing',
    },
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'COD', 'NetBanking', 'Wallet'], default: 'COD' },
    address:       { type: addressSchema, required: true },
    creditsEarned: { type: Number, default: 0 },
    deliveredAt:   { type: Date, default: null },
    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    isPaid:            { type: Boolean, default: false },
    paidAt:            { type: Date, default: null },
    platformFee:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

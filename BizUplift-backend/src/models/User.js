/**
 * models/User.js — User schema
 * Roles: customer | seller | admin
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    mobile:   { type: String, trim: true, default: '' },
    role:     { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
    avatar:   { type: String, default: '' },
    // seller reference (only for role='seller')
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', default: null },
    credits:  { type: Number, default: 0 },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = function (entered) {
    return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);

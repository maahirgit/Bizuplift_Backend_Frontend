/**
 * models/CreditLedger.js — Credit points ledger per user
 */
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    action:  { type: String, required: true },
    points:  { type: Number, required: true },
    type:    { type: String, enum: ['earn', 'redeem'], required: true },
    balance: { type: Number, required: true },
    date:    { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { _id: false });

const creditLedgerSchema = new mongoose.Schema({
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance:      { type: Number, default: 0, min: 0 },
    transactions: [transactionSchema],
}, { timestamps: true });

module.exports = mongoose.model('CreditLedger', creditLedgerSchema);

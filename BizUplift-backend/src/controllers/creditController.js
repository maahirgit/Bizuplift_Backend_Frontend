/**
 * controllers/creditController.js
 * Get credit balance & transactions, add/redeem credits.
 */
const CreditLedger = require('../models/CreditLedger');
const User = require('../models/User');

// GET /api/credits/me  (protected)
const getMyCredits = async (req, res, next) => {
    try {
        const ledger = await CreditLedger.findOne({ userId: req.user._id });
        if (!ledger) return res.json({ success: true, balance: 0, transactions: [] });
        res.json({ success: true, balance: ledger.balance, transactions: ledger.transactions });
    } catch (err) { next(err); }
};

// POST /api/credits/add  (protected — internal use)
const addCredits = async (req, res, next) => {
    try {
        const { points, action } = req.body;
        if (!points || !action)
            return res.status(400).json({ success: false, message: 'points and action are required' });

        let ledger = await CreditLedger.findOne({ userId: req.user._id });
        if (!ledger) ledger = new CreditLedger({ userId: req.user._id, balance: 0, transactions: [] });

        const newBalance = ledger.balance + Number(points);
        ledger.balance = newBalance;
        ledger.transactions.unshift({
            action,
            points: Number(points),
            type: points > 0 ? 'earn' : 'redeem',
            balance: newBalance,
        });
        await ledger.save();
        await User.findByIdAndUpdate(req.user._id, { credits: newBalance });

        res.json({ success: true, balance: newBalance });
    } catch (err) { next(err); }
};

// POST /api/credits/redeem  (protected)
const redeemCredits = async (req, res, next) => {
    try {
        const { points } = req.body;
        if (!points || points <= 0)
            return res.status(400).json({ success: false, message: 'Valid points amount required' });

        let ledger = await CreditLedger.findOne({ userId: req.user._id });
        if (!ledger || ledger.balance < points)
            return res.status(400).json({ success: false, message: 'Insufficient credit balance' });

        const newBalance = ledger.balance - Number(points);
        ledger.balance = newBalance;
        ledger.transactions.unshift({
            action: 'Redeemed for discount',
            points: -Number(points),
            type: 'redeem',
            balance: newBalance,
        });
        await ledger.save();
        await User.findByIdAndUpdate(req.user._id, { credits: newBalance });

        res.json({ success: true, balance: newBalance });
    } catch (err) { next(err); }
};

module.exports = { getMyCredits, addCredits, redeemCredits };

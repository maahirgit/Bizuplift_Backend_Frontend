/**
 * controllers/authController.js
 * Handles register, login, OTP login, get current user.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CreditLedger = require('../models/CreditLedger');

// Helper: generate signed JWT
const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Helper: send token response
const sendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(statusCode).json({ success: true, token, user: userObj });
};

// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password, mobile, role } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'name, email and password are required' });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ success: false, message: 'Email already registered' });

        const user = await User.create({ name, email, password, mobile: mobile || '', role: role || 'customer' });

        // Welcome bonus credits
        await CreditLedger.create({
            userId: user._id,
            balance: 100,
            transactions: [{ action: 'Welcome Bonus', points: 100, type: 'earn', balance: 100 }],
        });
        await User.findByIdAndUpdate(user._id, { credits: 100 });

        sendToken(user, 201, res);
    } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password are required' });

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ success: false, message: 'Invalid email or password' });

        sendToken(user, 200, res);
    } catch (err) { next(err); }
};

// POST /api/auth/login-otp  (mock: just finds user by mobile)
const loginWithOTP = async (req, res, next) => {
    try {
        const { mobile } = req.body;
        if (!mobile)
            return res.status(400).json({ success: false, message: 'Mobile number is required' });

        const user = await User.findOne({ mobile });
        if (!user)
            return res.status(404).json({ success: false, message: 'Mobile number not registered' });

        sendToken(user, 200, res);
    } catch (err) { next(err); }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
    res.json({ success: true, user: req.user });
};

// POST /api/auth/google
const loginWithGoogle = async (req, res, next) => {
    try {
        const { email, name, picture } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Google profile email is required' });

        let user = await User.findOne({ email });

        if (!user) {
            // Auto-register new Google user
            user = await User.create({
                name: name || email,
                email,
                password: 'GOOGLE_SSO_' + Date.now(), // placeholder — not used for login
                mobile: '',
                role: 'customer',
                avatar: picture || '',
            });
            // Welcome bonus credits
            await CreditLedger.create({
                userId: user._id,
                balance: 100,
                transactions: [{ action: 'Welcome Bonus', points: 100, type: 'earn', balance: 100 }],
            });
            await User.findByIdAndUpdate(user._id, { credits: 100, avatar: picture || '' });
        }

        sendToken(user, 200, res);
    } catch (err) { next(err); }
};

module.exports = { register, login, loginWithOTP, loginWithGoogle, getMe };

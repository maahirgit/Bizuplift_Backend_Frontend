/**
 * src/app.js — Express application setup
 * Registers middleware, routes, and error handler.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// ─── Route imports ───────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const postRoutes = require('./routes/postRoutes');
const negotiationRoutes = require('./routes/negotiationRoutes');
const creditRoutes = require('./routes/creditRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// ─── Core Middleware ─────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ─── Serve Static Files ──────────────────────────────────
// Maps /uploads requests to the backend's uploads/uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads/uploads')));

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'BizUplift API is running 🎉' });
});

// ─── API Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);

// ─── 404 handler ─────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────
app.use(errorHandler);

module.exports = app;

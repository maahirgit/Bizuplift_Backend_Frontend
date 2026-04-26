/**
 * api/index.js — Entry point for Vercel Serverless
 */

const app = require('../src/app');
const connectDB = require('../src/config/db');

// Connect to MongoDB Atlas (Vercel caches this connection across invocations)
connectDB().catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
});

module.exports = app;

/**
 * models/Post.js — Community post schema
 */
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName:   { type: String, required: true },
    authorAvatar: { type: String, default: '' },
    type:         { type: String, enum: ['review', 'tip', 'seller_story', 'general'], default: 'general' },
    festival:     { type: String, default: 'All' },
    content:      { type: String, required: true },
    image:        { type: String, default: null },
    likes:        { type: Number, default: 0 },
    likedBy:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments:     { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);

/**
 * controllers/postController.js
 * Community feed: create posts, get posts, toggle likes.
 */
const Post = require('../models/Post');
const CreditLedger = require('../models/CreditLedger');
const User = require('../models/User');

// GET /api/posts
// Query: festival, type, page, limit
const getPosts = async (req, res, next) => {
    try {
        const { festival, type, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (festival && festival !== 'All') filter.festival = festival;
        if (type) filter.type = type;

        const skip = (Number(page) - 1) * Number(limit);
        const [posts, total] = await Promise.all([
            Post.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
            Post.countDocuments(filter),
        ]);
        res.json({ success: true, total, page: Number(page), posts });
    } catch (err) { next(err); }
};

// POST /api/posts  (protected)
const createPost = async (req, res, next) => {
    try {
        const { type, festival, content, image } = req.body;
        if (!content) return res.status(400).json({ success: false, message: 'content is required' });

        const post = await Post.create({
            authorId: req.user._id,
            authorName: req.user.name,
            authorAvatar: req.user.avatar || '',
            type: type || 'general',
            festival: festival || 'All',
            content,
            image: image || null,
        });

        // Award 25 credits for posting
        let ledger = await CreditLedger.findOne({ userId: req.user._id });
        if (!ledger) ledger = new CreditLedger({ userId: req.user._id, balance: 0, transactions: [] });
        const newBalance = ledger.balance + 25;
        ledger.balance = newBalance;
        ledger.transactions.unshift({ action: 'Community Post', points: 25, type: 'earn', balance: newBalance });
        await ledger.save();
        await User.findByIdAndUpdate(req.user._id, { credits: newBalance });

        res.status(201).json({ success: true, post });
    } catch (err) { next(err); }
};

// PUT /api/posts/:id/like  (protected)
const toggleLike = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const userId = req.user._id;
        const alreadyLiked = post.likedBy.includes(userId);
        if (alreadyLiked) {
            post.likedBy.pull(userId);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            post.likedBy.push(userId);
            post.likes += 1;
        }
        await post.save();
        res.json({ success: true, likes: post.likes, liked: !alreadyLiked });
    } catch (err) { next(err); }
};

module.exports = { getPosts, createPost, toggleLike };

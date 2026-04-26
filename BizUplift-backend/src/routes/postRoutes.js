const express = require('express');
const router = express.Router();
const { getPosts, createPost, toggleLike } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/', getPosts);
router.post('/', protect, createPost);
router.put('/:id/like', protect, toggleLike);

module.exports = router;

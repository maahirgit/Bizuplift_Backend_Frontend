const express = require('express');
const router = express.Router();
const { getProductReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, addReview);

module.exports = router;

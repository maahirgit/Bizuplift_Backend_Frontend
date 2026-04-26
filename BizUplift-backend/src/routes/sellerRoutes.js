const express = require('express');
const router = express.Router();
const { getSellers, getSeller, createSeller, updateSeller } = require('../controllers/sellerController');
const { protect } = require('../middleware/auth');

router.get('/', getSellers);
router.get('/:id', getSeller);
router.post('/', protect, createSeller);
router.put('/:id', protect, updateSeller);

module.exports = router;

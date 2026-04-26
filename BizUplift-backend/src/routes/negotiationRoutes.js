const express = require('express');
const router = express.Router();
const { getNegotiation, saveNegotiation } = require('../controllers/negotiationController');
const { protect } = require('../middleware/auth');

router.get('/:productId', protect, getNegotiation);
router.post('/', protect, saveNegotiation);

module.exports = router;

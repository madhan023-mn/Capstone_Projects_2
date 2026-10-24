const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/product/:productId', protect, reviewController.createReview);

module.exports = router;

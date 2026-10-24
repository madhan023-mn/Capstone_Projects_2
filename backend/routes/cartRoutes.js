const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.patch('/items/:productId', cartController.updateQuantity);
router.delete('/items/:productId', cartController.removeFromCart);
router.post('/coupon', cartController.applyCoupon);

module.exports = router;

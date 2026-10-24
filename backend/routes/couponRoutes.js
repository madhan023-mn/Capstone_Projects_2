const express = require('express');
const couponController = require('../controllers/couponController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/', couponController.getAllCoupons);
router.post('/', couponController.createCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;

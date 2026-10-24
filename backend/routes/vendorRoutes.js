const express = require('express');
const vendorController = require('../controllers/vendorController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/apply', vendorController.applyForVendor);
router.get('/profile/me', vendorController.getMyVendorProfile);
router.patch('/profile/me', vendorController.updateVendorProfile);

// Vendor-only endpoints
router.get('/dashboard/stats', restrictTo('vendor', 'admin'), vendorController.getVendorDashboardStats);
router.get('/orders', restrictTo('vendor', 'admin'), vendorController.getVendorOrders);
router.patch('/orders/:id/status', restrictTo('vendor', 'admin'), vendorController.updateVendorOrderStatus);

module.exports = router;

const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/analytics/overview', adminController.getPlatformAnalytics);
router.get('/vendors', adminController.getAllVendors);
router.patch('/vendors/:id/status', adminController.updateVendorStatus);
router.get('/orders', adminController.getAllOrders);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

module.exports = router;

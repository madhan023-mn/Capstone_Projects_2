const express = require('express');
const orderController = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/checkout', orderController.checkoutAndCreateOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.get('/:id/invoice', orderController.getInvoicePDF);

module.exports = router;

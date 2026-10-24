const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public catalog endpoints
router.get('/', productController.getAllProducts);
router.get('/:slugOrId', productController.getProduct);

// Protected vendor endpoints
router.use(protect);
router.get('/vendor/my-products', restrictTo('vendor', 'admin'), productController.getMyVendorProducts);
router.post('/', restrictTo('vendor', 'admin'), productController.createProduct);
router.put('/:id', restrictTo('vendor', 'admin'), productController.updateProduct);
router.delete('/:id', restrictTo('vendor', 'admin'), productController.deleteProduct);

module.exports = router;

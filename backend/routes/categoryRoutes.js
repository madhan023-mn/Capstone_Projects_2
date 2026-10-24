const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', categoryController.getAllCategories);

// Admin-only management routes
router.use(protect);
router.post('/', restrictTo('admin'), categoryController.createCategory);
router.put('/:id', restrictTo('admin'), categoryController.updateCategory);
router.delete('/:id', restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;

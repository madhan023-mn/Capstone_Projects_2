const express = require('express');
const uploadController = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
  '/image',
  protect,
  restrictTo('vendor', 'admin'),
  uploadController.uploadSingleImage,
  uploadController.handleUploadResponse
);

module.exports = router;

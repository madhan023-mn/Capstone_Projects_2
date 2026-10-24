const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (Requires valid JWT)
router.use(protect);
router.get('/me', authController.getMe);
router.patch('/update-me', authController.updateMe);
router.patch('/update-password', authController.updatePassword);

// Address Book routes
router.get('/addresses', authController.getAddresses);
router.post('/addresses', authController.addAddress);
router.delete('/addresses/:id', authController.deleteAddress);

module.exports = router;

const Coupon = require('../models/Coupon');
const AppError = require('../utils/appError');

// Get all coupons (Admin)
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: coupons.length,
      data: { coupons },
    });
  } catch (error) {
    next(error);
  }
};

// Create coupon (Admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate } = req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      expiryDate,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// Delete coupon (Admin)
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return next(new AppError('Coupon not found', 404));

    res.status(200).json({
      success: true,
      message: 'Coupon deleted',
    });
  } catch (error) {
    next(error);
  }
};

const Review = require('../models/Review');
const Order = require('../models/Order');
const AppError = require('../utils/appError');

// GET /api/v1/reviews/product/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/reviews/product/:productId
exports.createReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

    // Check if user already reviewed this product
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) {
      return next(new AppError('You have already submitted a review for this product.', 400));
    }

    // Verify user purchased product (Verified Purchase tag)
    const hasPurchased = await Order.findOne({
      customer: req.user._id,
      'itemsSummary.product': productId,
      paymentStatus: 'paid',
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      title,
      comment,
      isVerifiedPurchase: !!hasPurchased,
    });

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      data: { review: populated },
    });
  } catch (error) {
    next(error);
  }
};

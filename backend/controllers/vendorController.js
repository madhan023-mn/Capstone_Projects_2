const VendorProfile = require('../models/VendorProfile');
const VendorOrder = require('../models/VendorOrder');
const Product = require('../models/Product');
const User = require('../models/User');
const AppError = require('../utils/appError');

// Apply for vendor registration
exports.applyForVendor = async (req, res, next) => {
  try {
    const { storeName, description, storeEmail, storePhone, storeAddress, bankDetails } = req.body;

    // Check if store name is already taken
    const existing = await VendorProfile.findOne({ storeName });
    if (existing) {
      return next(new AppError('Store name is already taken. Please choose another.', 400));
    }

    // Check if user already has a vendor profile
    let profile = await VendorProfile.findOne({ user: req.user._id });
    if (profile) {
      return next(new AppError('You have already submitted a vendor application.', 400));
    }

    profile = await VendorProfile.create({
      user: req.user._id,
      storeName,
      description,
      storeEmail: storeEmail || req.user.email,
      storePhone: storePhone || req.user.phone,
      storeAddress,
      bankDetails,
      status: 'approved', // Auto-approved for frictionless demo/internship testing
    });

    // Upgrade user role to vendor
    await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

    res.status(201).json({
      success: true,
      message: 'Vendor store application approved! Welcome to the seller portal.',
      data: { vendor: profile },
    });
  } catch (error) {
    next(error);
  }
};

// Get current vendor's profile
exports.getMyVendorProfile = async (req, res, next) => {
  try {
    let profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) {
      // Auto-create initial profile if user role is vendor
      if (req.user.role === 'vendor') {
        profile = await VendorProfile.create({
          user: req.user._id,
          storeName: `${req.user.name}'s Store`,
          storeEmail: req.user.email,
          status: 'approved',
        });
      } else {
        return next(new AppError('No vendor profile found for this account.', 404));
      }
    }

    res.status(200).json({
      success: true,
      data: { vendor: profile },
    });
  } catch (error) {
    next(error);
  }
};

// Update vendor profile
exports.updateVendorProfile = async (req, res, next) => {
  try {
    const allowed = ['description', 'storePhone', 'storeAddress', 'logo', 'banner', 'bankDetails'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const profile = await VendorProfile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Vendor store updated successfully',
      data: { vendor: profile },
    });
  } catch (error) {
    next(error);
  }
};

// Vendor dashboard analytics
exports.getVendorDashboardStats = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) return next(new AppError('Vendor profile not found', 404));

    const totalProducts = await Product.countDocuments({ vendor: profile._id });
    const orders = await VendorOrder.find({ vendor: profile._id }).sort('-createdAt');

    const totalOrders = orders.length;
    const totalGrossSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalCommissionPaid = orders.reduce((sum, o) => sum + o.commissionTotal, 0);
    const totalNetEarnings = orders.reduce((sum, o) => sum + o.vendorNetTotal, 0);

    const pendingOrdersCount = orders.filter((o) =>
      ['placed', 'confirmed', 'packed'].includes(o.fulfillmentStatus)
    ).length;

    res.status(200).json({
      success: true,
      data: {
        vendor: profile,
        stats: {
          totalProducts,
          totalOrders,
          pendingOrdersCount,
          totalGrossSales,
          totalCommissionPaid,
          totalNetEarnings,
          currentBalance: profile.currentBalance,
        },
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders for this vendor
exports.getVendorOrders = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) return next(new AppError('Vendor profile not found', 404));

    const orders = await VendorOrder.find({ vendor: profile._id })
      .populate('masterOrder', 'orderNumber customer shippingAddress paymentStatus createdAt')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// Update fulfillment status of a vendor suborder
exports.updateVendorOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingCarrier, trackingNumber } = req.body;
    const profile = await VendorProfile.findOne({ user: req.user._id });
    if (!profile) return next(new AppError('Vendor profile not found', 404));

    const order = await VendorOrder.findOne({
      _id: req.params.id,
      vendor: profile._id,
    });

    if (!order) return next(new AppError('Suborder not found or unauthorized', 404));

    if (status) {
      order.fulfillmentStatus = status;
      order.statusHistory.push({
        status,
        changedAt: new Date(),
        note: `Status updated to ${status} by seller`,
      });
    }

    if (trackingCarrier) order.trackingCarrier = trackingCarrier;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order fulfillment status updated to ${status}`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

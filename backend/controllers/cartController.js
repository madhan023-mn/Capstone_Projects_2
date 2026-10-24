const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { getRedisClient } = require('../config/redis');
const AppError = require('../utils/appError');

// Helper to get or create user's cart
const getUserCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'title slug price salePrice stock images brand vendor',
    populate: { path: 'vendor', select: 'storeName slug rating' },
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const mongoose = require('mongoose');

// GET /api/v1/cart
exports.getCart = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: {
          cart: {
            items: [],
            subtotal: 0,
            discountTotal: 0,
            taxTotal: 0,
            shippingFee: 0,
            grandTotal: 0,
          },
        },
      });
    }

    const cart = await getUserCart(req.user._id);

    // Sync live prices and stock
    let needsSave = false;
    cart.items = cart.items.filter((item) => {
      if (!item.product) {
        needsSave = true;
        return false;
      }
      const livePrice = item.product.salePrice || item.product.price;
      if (item.price !== livePrice) {
        item.price = livePrice;
        needsSave = true;
      }
      return true;
    });

    if (needsSave) {
      cart.calculateTotals();
      await cart.save();
    }

    res.status(200).json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/cart/items (Add to cart)
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new AppError('Product not found or currently unavailable', 404));
    }

    if (product.stock < quantity) {
      return next(
        new AppError(`Only ${product.stock} units in stock. Cannot add ${quantity}.`, 400)
      );
    }

    const cart = await getUserCart(req.user._id);
    const existingIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId.toString()
    );

    const price = product.salePrice || product.price;

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (product.stock < newQty) {
        return next(
          new AppError(`Cannot exceed available stock of ${product.stock} units.`, 400)
        );
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = price;
    } else {
      cart.items.push({
        product: product._id,
        vendor: product.vendor,
        quantity: Number(quantity),
        price,
      });
    }

    cart.calculateTotals();
    await cart.save();

    // Cache to Redis
    const redis = getRedisClient();
    if (redis && redis.set) {
      await redis.set(`cart:${req.user._id}`, JSON.stringify(cart), { EX: 86400 });
    }

    // Return populated cart
    const populated = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'title slug price salePrice stock images brand vendor',
      populate: { path: 'vendor', select: 'storeName slug rating' },
    });

    res.status(200).json({
      success: true,
      message: 'Item added to your basket',
      data: { cart: populated },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/cart/items/:productId (Update quantity)
exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await getUserCart(req.user._id);
    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return next(new AppError('Product not in cart', 404));
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (product && product.stock < quantity) {
        return next(new AppError(`Only ${product.stock} units available in stock.`, 400));
      }
      cart.items[itemIndex].quantity = quantity;
    }

    cart.calculateTotals();
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'title slug price salePrice stock images brand vendor',
      populate: { path: 'vendor', select: 'storeName slug rating' },
    });

    res.status(200).json({
      success: true,
      data: { cart: populated },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/cart/items/:productId
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await getUserCart(req.user._id);

    cart.items = cart.items.filter(
      (item) => item.product._id.toString() !== productId.toString()
    );

    cart.calculateTotals();
    await cart.save();

    const populated = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'title slug price salePrice stock images brand vendor',
      populate: { path: 'vendor', select: 'storeName slug rating' },
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: { cart: populated },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/cart/coupon
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return next(new AppError('Please provide a coupon code', 400));

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (!coupon) {
      return next(new AppError('Invalid or expired coupon code', 400));
    }

    const cart = await getUserCart(req.user._id);
    if (cart.subtotal < coupon.minOrderAmount) {
      return next(
        new AppError(
          `Order subtotal must be at least $${coupon.minOrderAmount} to use this coupon`,
          400
        )
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cart.subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    cart.appliedCoupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    };

    cart.calculateTotals();
    await cart.save();

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} applied! Saved $${discountAmount.toFixed(2)}`,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

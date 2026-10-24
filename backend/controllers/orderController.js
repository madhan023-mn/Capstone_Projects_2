const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const CommissionLedger = require('../models/CommissionLedger');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const VendorProfile = require('../models/VendorProfile');
const { getRedisClient } = require('../config/redis');
const AppError = require('../utils/appError');

// POST /api/v1/orders/checkout
exports.checkoutAndCreateOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'stripe_test' } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return next(new AppError('Please provide complete shipping address details', 400));
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'vendor' },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return next(new AppError('Your shopping basket is empty', 400));
    }

    // 1. Atomic Stock Verification and Reservation
    for (const item of cart.items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!product) {
        return next(
          new AppError(
            `Sorry, "${item.product.title}" has insufficient stock or just sold out. Please review your cart.`,
            400
          )
        );
      }
    }

    // 2. Generate Master Order Number
    const orderNumber =
      'ORD-' +
      new Date().toISOString().slice(0, 10).replace(/-/g, '') +
      '-' +
      Math.floor(1000 + Math.random() * 9000);

    const masterOrder = new Order({
      orderNumber,
      customer: req.user._id,
      shippingAddress,
      subtotal: cart.subtotal,
      discountAmount: cart.discountTotal || 0,
      shippingFee: 0, // Free shipping in demo
      taxAmount: Math.round(cart.subtotal * 0.05 * 100) / 100, // 5% mock tax
      grandTotal: cart.grandTotal + Math.round(cart.subtotal * 0.05 * 100) / 100,
      paymentStatus: 'paid', // Test mode auto-settlement
      paymentDetails: {
        provider: paymentMethod,
        transactionId: 'TXN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        paymentMethod: 'credit_card',
        paidAt: new Date(),
      },
      orderStatus: 'confirmed',
      itemsSummary: cart.items.map((it) => ({
        product: it.product._id,
        title: it.product.title,
        image: it.product.images[0] || '',
        quantity: it.quantity,
        price: it.price,
        vendor: it.product.vendor._id,
        vendorName: it.product.vendor.storeName,
      })),
    });

    await masterOrder.save();

    // 3. Multi-Vendor Suborder Splitting: Group items by Vendor
    const itemsByVendor = {};
    for (const item of cart.items) {
      const vendorId = item.product.vendor._id.toString();
      if (!itemsByVendor[vendorId]) {
        itemsByVendor[vendorId] = {
          vendorProfile: item.product.vendor,
          items: [],
        };
      }
      itemsByVendor[vendorId].items.push(item);
    }

    const createdSuborders = [];

    // Create suborder for each distinct vendor
    for (const [vendorId, vendorGroup] of Object.entries(itemsByVendor)) {
      const vendorProfile = vendorGroup.vendorProfile;
      const commissionPercent = vendorProfile.commissionRate || 10;

      let subtotal = 0;
      let commissionTotal = 0;

      const suborderItems = vendorGroup.items.map((it) => {
        const lineTotal = it.price * it.quantity;
        const lineCommission = (lineTotal * commissionPercent) / 100;
        const linePayout = lineTotal - lineCommission;

        subtotal += lineTotal;
        commissionTotal += lineCommission;

        return {
          product: it.product._id,
          title: it.product.title,
          image: it.product.images[0] || '',
          price: it.price,
          quantity: it.quantity,
          commissionPercent,
          commissionAmount: lineCommission,
          vendorPayout: linePayout,
        };
      });

      const vendorNetTotal = subtotal - commissionTotal;

      const suborder = await VendorOrder.create({
        masterOrder: masterOrder._id,
        vendor: vendorProfile._id,
        vendorUser: vendorProfile.user,
        items: suborderItems,
        subtotal,
        commissionTotal,
        vendorNetTotal,
        fulfillmentStatus: 'confirmed',
        statusHistory: [
          {
            status: 'confirmed',
            changedAt: new Date(),
            note: 'Order placed and payment verified in test mode',
          },
        ],
      });

      createdSuborders.push(suborder._id);

      // Record in Financial Commission Ledger
      await CommissionLedger.create({
        vendor: vendorProfile._id,
        masterOrder: masterOrder._id,
        vendorOrder: suborder._id,
        grossSales: subtotal,
        commissionPercentage: commissionPercent,
        platformCommissionFee: commissionTotal,
        vendorNetPayout: vendorNetTotal,
        status: 'available',
      });

      // Update Vendor Balance & Sales stats
      await VendorProfile.findByIdAndUpdate(vendorProfile._id, {
        $inc: {
          currentBalance: vendorNetTotal,
          totalSales: subtotal,
        },
      });
    }

    // Attach suborder IDs to master order
    masterOrder.vendorOrders = createdSuborders;
    await masterOrder.save();

    // 4. Clear Customer's Cart
    cart.items = [];
    cart.appliedCoupon = undefined;
    cart.subtotal = 0;
    cart.discountTotal = 0;
    cart.grandTotal = 0;
    await cart.save();

    const redis = getRedisClient();
    if (redis && redis.del) {
      await redis.del(`cart:${req.user._id}`);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed and confirmed successfully!',
      data: {
        order: masterOrder,
        subordersCount: createdSuborders.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate({
        path: 'vendorOrders',
        populate: { path: 'vendor', select: 'storeName slug logo' },
      })
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

// GET /api/v1/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate({
        path: 'vendorOrders',
        populate: { path: 'vendor', select: 'storeName slug logo storePhone' },
      });

    if (!order) return next(new AppError('Order not found', 404));

    // Security check: must be owner customer or admin or vendor involved
    if (
      order.customer._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('Unauthorized access to this order', 403));
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/:id/invoice (Download PDF Invoice)
exports.getInvoicePDF = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    if (!order) return next(new AppError('Order not found', 404));

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${order.orderNumber}.pdf`
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(22)
      .fillColor('#131921')
      .text('MarketVerse Marketplace Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).fillColor('#64748b');
    doc.text(`Invoice Number: ${order.orderNumber}`);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`);
    doc.text(`Transaction ID: ${order.paymentDetails.transactionId}`);
    doc.moveDown();

    doc.fontSize(12).fillColor('#0f172a').text('Billed To:');
    doc.fontSize(10).fillColor('#334155');
    doc.text(order.shippingAddress.fullName);
    doc.text(`${order.shippingAddress.street}, ${order.shippingAddress.city}`);
    doc.text(`${order.shippingAddress.state} - ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`);
    doc.text(`Phone: ${order.shippingAddress.phone}`);
    doc.moveDown();

    // Table Header
    doc.fontSize(10).fillColor('#0f172a');
    doc.text('Item Description', 50, doc.y, { width: 250 });
    doc.text('Qty', 310, doc.y - 12);
    doc.text('Unit Price', 370, doc.y - 12);
    doc.text('Total', 470, doc.y - 12);
    doc.moveDown(0.5);

    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Items
    for (const it of order.itemsSummary) {
      const y = doc.y;
      doc.text(`${it.title} (Sold by: ${it.vendorName})`, 50, y, { width: 250 });
      doc.text(`${it.quantity}`, 310, y);
      doc.text(`$${it.price.toFixed(2)}`, 370, y);
      doc.text(`$${(it.price * it.quantity).toFixed(2)}`, 470, y);
      doc.moveDown();
    }

    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Summary
    doc.text(`Subtotal: $${order.subtotal.toFixed(2)}`, { align: 'right' });
    if (order.discountAmount > 0) {
      doc.text(`Discount: -$${order.discountAmount.toFixed(2)}`, { align: 'right' });
    }
    doc.text(`Tax (5%): $${order.taxAmount.toFixed(2)}`, { align: 'right' });
    doc.fontSize(12).fillColor('#0f172a');
    doc.text(`Grand Total: $${order.grandTotal.toFixed(2)}`, { align: 'right' });

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor('#94a3b8')
      .text(
        'Thank you for shopping at MarketVerse. All items sold by independent marketplace sellers.',
        { align: 'center' }
      );

    doc.end();
  } catch (error) {
    next(error);
  }
};

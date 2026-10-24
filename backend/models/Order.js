const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      apartment: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
    },
    itemsSummary: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        image: String,
        quantity: Number,
        price: Number,
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorProfile' },
        vendorName: String,
      },
    ],
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      provider: { type: String, default: 'stripe_test' },
      transactionId: { type: String, default: '' },
      paymentMethod: { type: String, default: 'card' },
      paidAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'partially_shipped', 'completed', 'cancelled'],
      default: 'placed',
    },
    vendorOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorOrder',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

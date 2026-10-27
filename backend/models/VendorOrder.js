const mongoose = require('mongoose');
const createHybridModel = require('./_hybrid');

const vendorOrderSchema = new mongoose.Schema(
  {
    masterOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: true,
    },
    vendorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        image: String,
        price: Number,
        quantity: Number,
        commissionPercent: Number,
        commissionAmount: Number,
        vendorPayout: Number,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    commissionTotal: {
      type: Number,
      required: true,
    },
    vendorNetTotal: {
      type: Number,
      required: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    trackingCarrier: {
      type: String,
      default: '',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MongoVendorOrder = mongoose.models.VendorOrder || mongoose.model('VendorOrder', vendorOrderSchema);

module.exports = createHybridModel(MongoVendorOrder, 'VendorOrder');

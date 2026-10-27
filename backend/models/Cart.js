const mongoose = require('mongoose');
const createHybridModel = require('./_hybrid');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    appliedCoupon: {
      code: String,
      discountType: { type: String, enum: ['percentage', 'flat'] },
      discountValue: Number,
      discountAmount: { type: Number, default: 0 },
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compute totals
cartSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (this.appliedCoupon && this.appliedCoupon.code) {
    if (this.appliedCoupon.discountType === 'percentage') {
      discount = (this.subtotal * this.appliedCoupon.discountValue) / 100;
    } else {
      discount = this.appliedCoupon.discountValue;
    }
  }
  this.discountTotal = Math.min(discount, this.subtotal);
  this.grandTotal = Math.max(0, this.subtotal - this.discountTotal);
};

const MongoCart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

module.exports = createHybridModel(MongoCart, 'Cart');

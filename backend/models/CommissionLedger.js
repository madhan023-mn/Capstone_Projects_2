const mongoose = require('mongoose');

const commissionLedgerSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: true,
    },
    masterOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    vendorOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorOrder',
      required: true,
    },
    grossSales: {
      type: Number,
      required: true,
    },
    commissionPercentage: {
      type: Number,
      required: true,
    },
    platformCommissionFee: {
      type: Number,
      required: true,
    },
    vendorNetPayout: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_clearance', 'available', 'paid_out', 'reversed'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

const CommissionLedger = mongoose.model('CommissionLedger', commissionLedgerSchema);

module.exports = CommissionLedger;

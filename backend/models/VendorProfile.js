const mongoose = require('mongoose');
const createHybridModel = require('./_hybrid');

const vendorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor profile must be linked to a user account'],
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, 'Please provide your store or business name'],
      unique: true,
      trim: true,
      maxlength: [80, 'Store name cannot exceed 80 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: 'Authorized multi-vendor merchant providing genuine products.',
    },
    storeEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    storePhone: {
      type: String,
      trim: true,
    },
    storeAddress: {
      type: String,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=300&q=80',
    },
    banner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    },
    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' },
      routingOrIFSC: { type: String, default: '' },
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

vendorProfileSchema.pre('save', function (next) {
  if (this.isModified('storeName')) {
    this.slug = this.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const MongoVendorProfile = mongoose.models.VendorProfile || mongoose.model('VendorProfile', vendorProfileSchema);

module.exports = createHybridModel(MongoVendorProfile, 'VendorProfile');

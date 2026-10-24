const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: [true, 'Product must belong to a vendor store'],
    },
    vendorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product must reference vendor user account'],
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category'],
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product regular price is required'],
      min: [0, 'Price must be positive'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price must be positive'],
      validate: {
        validator: function (val) {
          // Sale price must be strictly less than or equal to regular price
          return !val || val <= this.price;
        },
        message: 'Sale price ({VALUE}) must be less than regular price',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      ],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above 0'],
      max: [5, 'Rating must be below 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    attributes: [
      {
        name: String,
        value: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Slug and SKU auto-generation
productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      randomSuffix;
  }
  if (!this.sku) {
    this.sku = 'SKU-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 899 + 100);
  }
  next();
});

// Full-text search index for high-speed fallback querying
productSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
});

// Compound indexes for sorting & filtering
productSchema.index({ category: 1, price: 1 });
productSchema.index({ vendor: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

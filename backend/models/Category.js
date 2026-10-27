const mongoose = require('mongoose');
const createHybridModel = require('./_hybrid');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [60, 'Category name cannot exceed 60 characters'],
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
      default: '',
    },
    iconUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80',
    },
    commissionPercentage: {
      type: Number,
      required: [true, 'Commission percentage is required'],
      default: 10,
      min: [0, 'Commission cannot be negative'],
      max: [100, 'Commission cannot exceed 100%'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before save
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

const MongoCategory = mongoose.models.Category || mongoose.model('Category', categorySchema);

module.exports = createHybridModel(MongoCategory, 'Category');

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Address must belong to a user'],
    },
    fullName: {
      type: String,
      required: [true, 'Please provide recipient full name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Please provide street address'],
      trim: true,
    },
    apartment: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide state/province'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Please provide postal/zip code'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      default: 'India',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    addressType: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
  },
  {
    timestamps: true,
  }
);

// If an address is set as default, remove default flag from other addresses of the user
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;

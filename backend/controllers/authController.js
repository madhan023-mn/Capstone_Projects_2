const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Address = require('../models/Address');
const VendorProfile = require('../models/VendorProfile');
const Order = require('../models/Order');
const AppError = require('../utils/appError');

// Helper to generate signed JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper to sanitize user output and return response with token
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
        createdAt: user.createdAt,
      },
    },
  });
};

/**
 * @desc   Register a new customer or vendor
 * @route  POST /api/v1/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 400));
    }

    const assignedRole = role === 'vendor' ? 'vendor' : 'customer';

    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      role: assignedRole,
    });

    createSendToken(newUser, 201, res, 'Account registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Login user
 * @route  POST /api/v1/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (user.status === 'suspended') {
      return next(
        new AppError('Your account has been suspended. Please contact support.', 403)
      );
    }

    createSendToken(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get current authenticated user profile with role-specific stats
 * @route  GET /api/v1/auth/me
 * @access Authenticated
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let extra = {};

    if (user.role === 'vendor') {
      const vendorProfile = await VendorProfile.findOne({ user: user._id });
      extra.vendorProfile = vendorProfile;
    } else if (user.role === 'customer') {
      const [orderCount, addresses] = await Promise.all([
        Order.countDocuments({ customer: user._id }),
        Address.find({ user: user._id }).sort('-isDefault -createdAt'),
      ]);
      extra.orderCount = orderCount;
      extra.addresses = addresses;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        ...extra,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update current user name & phone
 * @route  PATCH /api/v1/auth/update-me
 * @access Authenticated
 */
exports.updateMe = async (req, res, next) => {
  try {
    if (req.body.password || req.body.role) {
      return next(
        new AppError('This route is not for password or role updates.', 400)
      );
    }

    const filteredBody = {};
    if (req.body.name) filteredBody.name = req.body.name;
    if (req.body.phone) filteredBody.phone = req.body.phone;
    if (req.body.avatar) filteredBody.avatar = req.body.avatar;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update password
 * @route  PATCH /api/v1/auth/update-password
 * @access Authenticated
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide both current and new password', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError('Your current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res, 'Password updated successfully!');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get user addresses
 * @route  GET /api/v1/auth/addresses
 * @access Authenticated
 */
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort('-isDefault -createdAt');
    res.status(200).json({
      success: true,
      count: addresses.length,
      data: { addresses },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Add new address
 * @route  POST /api/v1/auth/addresses
 * @access Authenticated
 */
exports.addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, street, apartment, city, state, postalCode, country, isDefault, addressType } = req.body;

    const newAddress = await Address.create({
      user: req.user.id,
      fullName,
      phone,
      street,
      apartment,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: isDefault || false,
      addressType: addressType || 'home',
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address: newAddress },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete address
 * @route  DELETE /api/v1/auth/addresses/:id
 * @access Authenticated
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!address) return next(new AppError('Address not found', 404));

    res.status(200).json({
      success: true,
      message: 'Address removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

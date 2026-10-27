const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Address = require('../models/Address');
const VendorProfile = require('../models/VendorProfile');
const Order = require('../models/Order');
const AppError = require('../utils/appError');
const fallbackData = require('../utils/fallbackData');

// Helper to generate signed JWT token (30-day session by default)
const signToken = (user) => {
  const id = typeof user === 'object' ? (user._id || user.id) : user;
  const email = typeof user === 'object' ? user.email : '';
  const role = typeof user === 'object' ? user.role : 'customer';
  const name = typeof user === 'object' ? user.name : '';

  return jwt.sign(
    { id: String(id), email, role, name },
    process.env.JWT_SECRET || 'marketverse-super-secret-jwt-key-2024',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    }
  );
};

// Helper to sanitize user output and return response with token
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user);
  const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: {
        id: userObj._id || userObj.id,
        _id: userObj._id || userObj.id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        phone: userObj.phone,
        avatar: userObj.avatar,
        status: userObj.status,
        createdAt: userObj.createdAt,
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

    const cleanEmail = String(email).trim().toLowerCase();

    if (mongoose.connection.readyState !== 1) {
      const existingUser = fallbackData.users.find((u) => u.email === cleanEmail);
      if (existingUser) {
        return next(new AppError('An account with this email already exists', 400));
      }
      const newUser = {
        _id: `demo_${Date.now()}`,
        id: `demo_${Date.now()}`,
        name: String(name).trim(),
        email: cleanEmail,
        password: password,
        role: role === 'vendor' ? 'vendor' : 'customer',
        phone: phone || '',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      fallbackData.users.push(newUser);
      return createSendToken(newUser, 201, res, 'Account registered successfully (Demo Session)');
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 400));
    }

    const assignedRole = role === 'vendor' ? 'vendor' : 'customer';

    const newUser = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      password,
      phone: phone || '',
      role: assignedRole,
    });

    // Also cache user in fallbackData so any worker can authenticate seamlessly
    fallbackData.users.push({
      _id: String(newUser._id || newUser.id),
      id: String(newUser._id || newUser.id),
      name: newUser.name,
      email: cleanEmail,
      password,
      role: assignedRole,
      phone: phone || '',
      status: 'active',
      createdAt: new Date().toISOString(),
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

    const cleanEmail = String(email).trim().toLowerCase();

    let user;
    try {
      user = await User.findOne({ email: cleanEmail }).select('+password');
    } catch (dbErr) {
      // Fallback if DB error occurs
      user = null;
    }

    // If not found in primary store, check demo fallback data
    if (!user) {
      const match = fallbackData.users.find(
        (u) => u.email.trim().toLowerCase() === cleanEmail
      );
      if (match && match.password) {
        const isMatch = match.password === password || (match.password.startsWith('$2') && await bcrypt.compare(password, match.password));
        if (isMatch) {
          return createSendToken(match, 200, res, 'Logged in successfully');
        }
      }
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!(await user.correctPassword(password, user.password))) {
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
    if (mongoose.connection.readyState !== 1) {
      const user = req.user;
      let extra = {};
      if (user.role === 'vendor') {
        extra.vendorProfile = fallbackData.vendorProfiles[0];
      }
      return res.status(200).json({
        success: true,
        data: {
          user,
          ...extra,
        },
      });
    }

    let user = null;
    try {
      user = await User.findById(req.user.id || req.user._id);
    } catch (e) {
      user = req.user;
    }

    if (!user) user = req.user;
    const safeUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete safeUser.password;

    let extra = {};

    if (user.role === 'vendor') {
      const vendorProfile = await VendorProfile.findOne({ user: user._id || user.id });
      extra.vendorProfile = vendorProfile || fallbackData.vendorProfiles[0];
    } else if (user.role === 'customer') {
      try {
        const [orderCount, addresses] = await Promise.all([
          Order.countDocuments({ customer: user._id || user.id }),
          Address.find({ user: user._id || user.id }).sort('-isDefault -createdAt'),
        ]);
        extra.orderCount = orderCount;
        extra.addresses = addresses;
      } catch (e) {
        extra.orderCount = 0;
        extra.addresses = [];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        user: safeUser,
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

    let updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      const match = fallbackData.users.find((u) => u.id === req.user.id || u._id === req.user.id);
      if (match) {
        Object.assign(match, filteredBody);
        updatedUser = match;
      }
    }

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

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const AppError = require('../utils/appError');
const fallbackData = require('../utils/fallbackData');

/**
 * Middleware to protect routes: verifies JWT and attaches user to req
 */
const protect = async (req, res, next) => {
  try {
    // 1) Extract token from authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'marketverse-super-secret-jwt-key-2024');

    // 3) Check if user exists in database
    let currentUser = null;
    try {
      currentUser = await User.findById(decoded.id);
      if (!currentUser && decoded.email) {
        currentUser = await User.findOne({ email: decoded.email.trim().toLowerCase() });
      }
    } catch (e) {
      currentUser = null;
    }

    if (!currentUser) {
      const match = fallbackData.users.find(
        (u) =>
          u._id === decoded.id ||
          u.id === decoded.id ||
          (decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase())
      );
      if (match) {
        currentUser = {
          ...match,
          changedPasswordAfter: () => false,
        };
      } else if (decoded.id) {
        // Re-hydrate registered user from valid signed JWT to survive serverless cold starts & multi-container resets
        currentUser = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.name || 'MarketVerse User',
          email: decoded.email || '',
          role: decoded.role || 'customer',
          status: 'active',
          changedPasswordAfter: () => false,
        };
        try {
          await User.create(currentUser);
        } catch (_) {}
      }
    }

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Check if user account is suspended
    if (currentUser.status === 'suspended') {
      return next(
        new AppError('Your account has been suspended. Please contact marketplace support.', 403)
      );
    }

    // 5) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

    // Grant Access: attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 * Example: restrictTo('admin') or restrictTo('vendor', 'admin')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};

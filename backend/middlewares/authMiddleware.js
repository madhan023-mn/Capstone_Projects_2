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

    // If database is offline, resolve from in-memory demo users
    if (mongoose.connection.readyState !== 1) {
      const match = fallbackData.users.find(u => u._id === decoded.id || u.id === decoded.id);
      if (match) {
        req.user = {
          ...match,
          changedPasswordAfter: () => false,
        };
        return next();
      }
    }

    // 3) Check if user still exists
    let currentUser = null;
    try {
      currentUser = await User.findById(decoded.id);
    } catch (e) {
      // Continue to fallback
    }

    if (!currentUser) {
      const match = fallbackData.users.find(u => u._id === decoded.id || u.id === decoded.id);
      if (match) {
        req.user = {
          ...match,
          changedPasswordAfter: () => false,
        };
        return next();
      }
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

const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue).join(', ');
  const message = `Duplicate value '${value}'. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid authentication token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your authentication token has expired! Please log in again.', 401);

// Global Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production Mode: don't leak details of non-operational programming bugs
    let error = { ...err, message: err.message };

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    if (error.isOperational) {
      res.status(error.statusCode).json({
        success: false,
        status: error.status,
        message: error.message,
      });
    } else {
      console.error('ERROR 💥:', err);
      res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went very wrong on the server!',
      });
    }
  }
};

module.exports = errorHandler;

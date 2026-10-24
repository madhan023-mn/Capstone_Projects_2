require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const { initRedis } = require('./config/redis');
const { initElasticsearch } = require('./config/elasticsearch');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/appError');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const couponRoutes = require('./routes/couponRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// 1. Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// 2. CORS configuration (supports localhost, vercel deployments, and custom domains)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, serverless internal)
      // or from localhost, 127.0.0.1, or any vercel.app domain
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.vercel.app') ||
        process.env.CLIENT_URL === origin
      ) {
        callback(null, true);
      } else {
        // Fallback allow for deployed domain
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Middleware to ensure DB connection is active for each request (vital for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection middleware warning:', err.message);
  }
  next();
});

// 3. Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting for General API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in 15 minutes',
  },
});
app.use('/api/', apiLimiter);

// 5. Body Parsers (Note: Payment webhooks need raw body, handled if needed in webhook route)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Serve local uploads statically as fallback when S3 is not active
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7. Base Routes
app.use('/api', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Multi-Vendor E-Commerce Marketplace API',
    documentation: '/api/docs',
    health: '/api/health',
  });
});

// 8. 404 Route Handler for undefined endpoints
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server!`, 404));
});

// 9. Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server & Connect Services
const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Initialize Redis cache client
    await initRedis();

    // Initialize Elasticsearch client
    await initElasticsearch();

    app.listen(PORT, () => {
      console.log(`🚀 Multi-Vendor Backend Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;

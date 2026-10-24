const mongoose = require('mongoose');
const Product = require('../models/Product');
const VendorProfile = require('../models/VendorProfile');
const Category = require('../models/Category');
const AppError = require('../utils/appError');
const fallbackData = require('../utils/fallbackData');

// Public: Get all products with full search, filters, sorting & pagination
exports.getAllProducts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let filtered = [...fallbackData.products];
      if (req.query.q) {
        const qLower = req.query.q.toLowerCase();
        filtered = filtered.filter(
          p => p.title.toLowerCase().includes(qLower) || p.description.toLowerCase().includes(qLower) || p.brand.toLowerCase().includes(qLower)
        );
      }
      return res.status(200).json({
        success: true,
        count: filtered.length,
        totalCount: filtered.length,
        totalPages: 1,
        currentPage: 1,
        data: { products: filtered },
      });
    }

    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      brand,
      sort,
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const filter = { isActive: true, isApproved: true };

    // 1. Text Search (title, description, brand)
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
      ];
    }

    // 2. Category Filter (by slug or ObjectId)
    if (category && category !== 'all') {
      const catDoc = await Category.findOne({
        $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }],
      });
      if (catDoc) filter.category = catDoc._id;
    }

    // 3. Price Range Filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 4. Rating Filter
    if (rating) {
      filter.ratingsAverage = { $gte: Number(rating) };
    }

    // 5. Brand Filter
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // 6. Featured
    if (featured === 'true') {
      filter.featured = true;
    }

    // Sorting
    let sortBy = '-createdAt';
    if (sort === 'price-low') sortBy = 'price';
    if (sort === 'price-high') sortBy = '-price';
    if (sort === 'rating') sortBy = '-ratingsAverage';
    if (sort === 'newest') sortBy = '-createdAt';

    const skip = (Number(page) - 1) * Number(limit);

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('vendor', 'storeName slug rating logo')
        .populate('category', 'name slug')
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get single product by ID or Slug
exports.getProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const match = fallbackData.products.find(
        p => p._id === req.params.slugOrId || p.slug === req.params.slugOrId
      ) || fallbackData.products[0];
      return res.status(200).json({
        success: true,
        data: { product: match },
      });
    }

    const isId = req.params.slugOrId.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: req.params.slugOrId } : { slug: req.params.slugOrId };

    const product = await Product.findOne(query)
      .populate('vendor', 'storeName slug rating description logo banner')
      .populate('category', 'name slug commissionPercentage');

    if (!product) return next(new AppError('Product not found', 404));

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    if (fallbackData.products.length > 0) {
      return res.status(200).json({
        success: true,
        data: { product: fallbackData.products[0] },
      });
    }
    next(error);
  }
};

// Vendor: Create product
exports.createProduct = async (req, res, next) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ user: req.user._id });
    if (!vendorProfile) {
      return next(new AppError('You must register your vendor store before adding products', 400));
    }

    const {
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      stock,
      images,
      attributes,
      featured,
    } = req.body;

    const newProduct = await Product.create({
      vendor: vendorProfile._id,
      vendorUser: req.user._id,
      title,
      description,
      category,
      brand,
      price,
      salePrice: salePrice || undefined,
      stock,
      images: images && images.length ? images : undefined,
      attributes,
      featured: featured || false,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: newProduct },
    });
  } catch (error) {
    next(error);
  }
};

// Vendor: Update product (with ownership verification)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    // Ownership check: must be owner vendor or admin
    if (product.vendorUser.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to modify this product', 403));
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updated },
    });
  } catch (error) {
    next(error);
  }
};

// Vendor: Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

    if (product.vendorUser.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to delete this product', 403));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product removed from catalog successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Vendor: Get all products owned by current vendor
exports.getMyVendorProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ vendorUser: req.user._id })
      .populate('category', 'name slug')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

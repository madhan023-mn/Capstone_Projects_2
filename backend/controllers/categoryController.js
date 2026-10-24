const Category = require('../models/Category');
const AppError = require('../utils/appError');

// Get all categories (Public)
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.status(200).json({
      success: true,
      count: categories.length,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// Create category (Admin only)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, iconUrl, commissionPercentage } = req.body;
    const category = await Category.create({
      name,
      description,
      iconUrl,
      commissionPercentage,
    });
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Update category (Admin only)
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return next(new AppError('Category not found', 404));

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Delete category (Admin only)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError('Category not found', 404));

    res.status(200).json({
      success: true,
      message: 'Category removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

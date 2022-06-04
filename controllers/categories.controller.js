// Models
const { Category } = require('../models/category.model');

// Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

const createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await Category.create({
    name,
  });

  res.status(201).json({
    status: 'success',
    newCategory,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.findAll({
    where: {
      status: 'active',
    },
    attributes: ['id', 'name'],
  });

  res.status(200).json({
    status: 'success',
    categories,
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findOne({
    where: {
      status: 'active',
      id,
    },
  });

  if (!category) {
    return next(new AppError('Category does not exits with given id'));
  }

  await category.update({
    name,
  });

  res.status(200).json({
    status: 'success',
    category,
  });
});

module.exports = { getAllCategories, createCategory, updateCategory };

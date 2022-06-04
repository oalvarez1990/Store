// Models
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');
const { User } = require('../models/user.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: {
      status: 'active',
    },
    attributes: ['id', 'title', 'description', 'quantity', 'price'],
    include: [
      {
        model: Category,
        attributes: ['id', 'name'],
      },
      {
        model: User,
        attributes: ['id', 'username'],
      },
    ],
  });

  if (!products) {
    return next(new AppError('There are no products'));
  }

  res.status(200).json({
    status: 'success',
    products,
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  const { product } = req;

  res.status(200).json({
    status: 'success',
    product,
  });
});

const createProduct = catchAsync(async (req, res, next) => {
  const { title, description, price, quantity, categoryId } = req.body;
  const { sessionUser } = req;

  const newProduct = await Product.create({
    title,
    description,
    price,
    quantity,
    userId: sessionUser.id,
    categoryId,
  });

  res.status(201).json({
    status: 'success',
    newProduct,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const { title, description, price, quantity } = req.body;
  const data = {};
  const { product } = req;

  console.table(req.body);

  if (title) data.title = title;
  if (description) data.description = description;
  if (price) data.price = price;
  if (quantity) data.quantity = quantity;

  await product.update({ ...data });

  res.status(200).json({
    status: 'success',
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  await product.update({
    status: 'removed',
  });

  res.status(200).json({
    status: 'success',
  });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

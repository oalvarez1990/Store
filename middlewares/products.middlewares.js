// Models
const { Product } = require('../models/product.model');

// Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

const productExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { productId } = req.body;

  const product = await Product.findOne({
    where: { id: id || productId, status: 'active' },
    attributes: { exclude: ['password'] },
  });

  if (!product) {
    return next(new AppError('Product does not exist with given Id', 404));
  }

  // Add product data to the req object
  req.product = product;

  next();
});

const protectProductOwner = catchAsync(async (req, res, next) => {
  const { product, sessionUser } = req;

  if (product.userId !== sessionUser.id) {
    return next(new AppError('You do not own this product', 403));
  }

  next();
});

module.exports = { productExists, protectProductOwner };

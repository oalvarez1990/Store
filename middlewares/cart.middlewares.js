// Models
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Product } = require('../models/product.model');

const cartExists = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: {
      userId: sessionUser.id,
      status: 'active',
    },
    include: [
      {
        model: ProductInCart,
        include: Product,
      },
    ],
  });

  if (!cart) {
    return next(new AppError(400, 'This user does not have a cart yet'));
  }

  req.cart = cart;

  next();
});

module.exports = { cartExists };

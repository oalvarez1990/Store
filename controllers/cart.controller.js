// Models
const { Cart } = require('../models/cart.model');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/productInCart.model');
const { User } = require('../models/user.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Order } = require('../models/order.model');

const getUserCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: {
      userId: sessionUser.id,
      status: 'active',
    },
    attributes: ['id'],
    include: [
      {
        model: User,
        attributes: ['id', 'username'],
      },
      {
        model: ProductInCart,
        attributes: ['id', 'productId', 'quantity', 'cartId', 'status'],
        required: false,
        where: { status: 'active' },
      },
    ],
  });

  if (!cart) {
    return next(new AppError('This user does not have a cart yet', 404));
  }

  res.status(200).json({
    status: 'success',
    cart,
  });
});

const addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser } = req;

  // Find a product with the given productId
  const product = await Product.findOne({
    where: {
      status: 'active',
      id: productId,
    },
  });

  if (!product) {
    return next(new AppError('Product does not exists whit given id'), 400);
  }

  // Check if product to add, does not exceeds that requested amount
  if (quantity > product.quantity) {
    return next(
      new AppError(`This product only has ${product.quantity} items.`, 400)
    );
  }

  // Find if sessionUser has a cart
  const cart = await Cart.findOne({
    where: {
      status: 'active',
      userId: sessionUser.id,
    },
  });

  if (!cart) {
    // Create a cart for the user
    const newCart = await Cart.create({
      userId: sessionUser.id,
    });

    await ProductInCart.create({
      cartId: newCart.id,
      productId,
      quantity,
    });
  } else {
    // Add Products to Cart
    // Check if product is already in the cart
    const productExists = await ProductInCart.findOne({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (productExists && productExists.status === 'active') {
      return next(new AppError('This product is already in the cart', 400));
    }

    // Check if product is in the cart but was removed before, add it again
    if (productExists && productExists.status === 'removed') {
      await productExists.update({
        status: 'active',
        quantity,
      });
    }

    // Add new product to cart
    if (!productExists) {
      await ProductInCart.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }
  }

  res.status(201).json({ status: 'success' });
});

const updateProductInCart = catchAsync(async (req, res, next) => {
  const { productId, newQty } = req.body;
  const { cart, product } = req;

  if (newQty > product.quantity) {
    return next(
      new AppError(`This product only has ${product.quantity} items.`, 400)
    );
  }

  const updateProductInCart = await ProductInCart.findOne({
    where: {
      productId,
      cartId: cart.id,
    },
  });

  if (!updateProductInCart) {
    return next(
      new AppError(`Can't update product, is not in the cart yet`, 404)
    );
  }

  if (newQty === 0) {
    await updateProductInCart.update({
      quantity: newQty,
      status: 'removed',
    });
  } else {
    await updateProductInCart.update({
      quantity: newQty,
      status: 'active',
    });
  }

  res.status(200).json({ status: 'success' });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser, cart } = req;

  let totalPrice = 0;

  const cartPromises = await cart.productInCarts.map(async product => {
    await product.update({ status: 'purchased' });

    const productPrice = product.product.price * product.quantity;

    totalPrice += productPrice;

    let newQty = product.product.quantity - product.quantity;

    if (newQty < 0) {
      return next(
        new AppError(`This product only has ${product.quantity} items.`, 400)
      );
    }

    return await product.product.update({
      quantity: newQty,
    });
  });

  await Promise.all(cartPromises);

  await cart.update({
    status: 'purchased',
  });

  const newOrder = await Order.create({
    totalPrice,
    userId: sessionUser.id,
    cartId: cart.id,
  });

  res.status(200).json({ status: 'success', order: newOrder });
});

const removeProductFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  const deleteProductInCart = await ProductInCart.findOne({
    where: {
      status: 'active',
      productId,
    },
  });

  if (!deleteProductInCart) {
    return next(new AppError('This product do not exists in the cart', 400));
  }

  await deleteProductInCart.update({
    productId: 0,
    status: 'removed',
  });

  res.status(200).json({ status: 'success' });
});

module.exports = {
  getUserCart,
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
};

const express = require('express');

// Controllers
const {
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
  getUserCart,
} = require('../controllers/cart.controller');

// Middlewares
const { protectToken } = require('../middlewares/users.middlewares');
const { cartExists } = require('../middlewares/cart.middlewares');
const { productExists } = require('../middlewares/products.middlewares');
const {
  addProductToCartValidations,
  checkValidations,
  updateProductInCartValidations,
} = require('../middlewares/validations.middlewares');

const router = express.Router();

router.use(protectToken);

router.get('/', getUserCart);

router.post(
  '/add-product',
  addProductToCartValidations,
  checkValidations,
  addProductToCart
);

router.patch(
  '/update-cart',
  updateProductInCartValidations,
  checkValidations,
  cartExists,
  productExists,
  updateProductInCart
);

router.post('/purchase', cartExists, purchaseCart);

router.delete('/:productId', removeProductFromCart);

module.exports = { cartRouter: router };

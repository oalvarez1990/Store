const express = require('express');

// Controllers
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller');
const {
  getAllCategories,
  updateCategory,
  createCategory,
} = require('../controllers/categories.controller');

// Middlewares
const {
  protectToken,
  protectAdmin,
} = require('../middlewares/users.middlewares');
const {
  createProductValidations,
  checkValidations,
  createCategoryValidations,
  updateCategoryValidations,
  updateProductValidations,
} = require('../middlewares/validations.middlewares');
const {
  protectProductOwner,
  productExists,
} = require('../middlewares/products.middlewares');

const router = express.Router();

router.get('/', getAllProducts);

router.use(protectToken);

router.post(
  '/categories',
  protectAdmin,
  createCategoryValidations,
  checkValidations,
  createCategory
);

router.get('/categories', getAllCategories);

router.patch(
  '/categories/:id',
  updateCategoryValidations,
  checkValidations,
  updateCategory
);

router.post('/', createProductValidations, checkValidations, createProduct);

router
  .route('/:id')
  .get(productExists, getProductById)
  .patch(
    productExists,
    protectProductOwner,
    updateProductValidations,
    checkValidations,
    updateProduct
  )
  .delete(productExists, protectProductOwner, deleteProduct);

module.exports = { productsRouter: router };

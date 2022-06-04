const { body, validationResult } = require('express-validator');

// Utils
const { AppError } = require('../utils/appError');

const createUserValidations = [
  body('username')
    .notEmpty()
    .withMessage('Username cannot be empty')
    .isString()
    .withMessage('Username must be a string'),
  body('email')
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const loginUserValidations = [
  body('email')
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const updateUserValidations = [
  body('username').optional().isString(),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
];

const createProductValidations = [
  body('title')
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isString()
    .withMessage('Title must be a string'),
  body('description')
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isString()
    .withMessage('Description must be a string'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be greater than 0'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be greater than 0'),
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Must provide a valid categoryId'),
];

const updateProductValidations = [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than 0'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be greater than 0'),
];

const createCategoryValidations = [
  body('name')
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isString()
    .withMessage('Name must be a string'),
];

const updateCategoryValidations = [
  body('name').optional().isString().withMessage('Name must be a string'),
];

const addProductToCartValidations = [
  body('productId').isNumeric().withMessage('Must provide a productId'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be greater than 0'),
];

const updateProductInCartValidations = [
  body('productId').isNumeric().withMessage('Must provide a productId'),
  body('newQty')
    .isInt({ min: 0 })
    .withMessage('NewQty must be a number greater than or equal to 0'),
];

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map(({ msg }) => msg);

    // [msg, msg, msg] -> 'msg. msg. msg'
    const errorMsg = messages.join('. ');

    return next(new AppError(errorMsg, 400));
  }

  next();
};

module.exports = {
  createUserValidations,
  loginUserValidations,
  updateUserValidations,
  createProductValidations,
  updateProductValidations,
  createCategoryValidations,
  updateCategoryValidations,
  addProductToCartValidations,
  updateProductInCartValidations,
  checkValidations,
};

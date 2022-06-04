const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// require('crypto').randomBytes(64).toString('hex')

// Models
const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

dotenv.config({ path: './config.env' });

const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.findAll({
    where: {
      status: 'active',
    },
    attributes: ['id', 'username', 'email', 'role'],
  });

  res.status(200).json({
    users,
  });
});

const createUser = catchAsync(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Encrypt user password
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashPassword,
    role,
  });

  // Remove password from response
  newUser.password = undefined;

  res.status(201).json({ newUser });
});

const getUserById = catchAsync(async (req, res) => {
  const { user } = req;

  res.status(200).json({
    user,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { username, email } = req.body;
  const data = {};

  // Validate if the email and username property exists from the req.body
  if (username) data.username = username;
  if (email) data.email = email;

  await user.update({ ...data });

  res.status(200).json({ status: 'success' });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  // Soft delete
  await user.update({ status: 'deleted' });

  res.status(200).json({
    status: 'success',
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate that user exists with given email
  const user = await User.findOne({
    where: { email, status: 'active' },
  });

  // Compare password with db
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid credentials', 400));
  }

  // Generate JWT
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Remove password from response
  user.password = undefined;

  res.status(200).json({ token, user });
});

const checkToken = catchAsync(async (req, res) => {
  res.status(200).json({ user: req.sessionUser });
});

const getUserProducts = catchAsync(async (req, res) => {
  const { sessionUser } = req;

  const products = await Product.findAll({
    where: {
      userId: sessionUser.id,
      status: 'active',
    },
    attributes: ['id', 'title', 'description', 'quantity', 'price'],
  });

  res.status(200).json({ status: 'success', products });
});

const getUserOrders = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const userOrders = await Order.findAll({
    where: {
      userId: sessionUser.id,
    },
  });

  if (!userOrders) {
    return next(new AppError("You haven't made any purchases yet", 400));
  }

  res.status(200).json({ status: 'success', orders: userOrders });
});

const getUserOrderById = catchAsync(async () => {
  const { sessionUser } = req;
  const { id } = req.params;

  const userOrderById = await Order.findOne({
    where: {
      status: 'purchased',
      userId: sessionUser.id,
      id,
    },
  });

  if (!userOrderById) {
    return next(new AppError('There is no purchase with the provided id', 400));
  }

  res.status(200).json({ status: 'success', order: userOrderById });
});

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  login,
  checkToken,
  getUserProducts,
  getUserOrders,
  getUserOrderById,
};

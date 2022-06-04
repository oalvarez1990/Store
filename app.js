const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Controllers
const { globalErrorHandler } = require('./controllers/errors.controller');

// Routers
const { usersRouter } = require('./routes/users.routes');
const { productsRouter } = require('./routes/products.routes');
const { cartRouter } = require('./routes/cart.routes');

// Utils
const { AppError } = require('./utils/appError');

// Init express app
const app = express();

// Enable CORS
app.use(cors());

// Enable incoming JSON data
app.use(express.json());

// Limit IP requests
const limiter = rateLimit({
  max: 10000,
  windowMs: 1 * 60 * 60 * 1000, // 1 hr
  message: 'Too many requests from this IP',
});

app.use(limiter);

// Endpoints
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/cart', cartRouter);

// Global error handler
app.use('*', (req, res, next) => {
  return next(
    new AppError(`${req.originalUrl} not found in this server.`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = { app };

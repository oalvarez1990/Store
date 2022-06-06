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

// window._ = require('lodash');

// try {
//     require('bootstrap');
// } catch (e) {}

// /**
//  * We'll load the axios HTTP library which allows us to easily issue requests
//  * to our Laravel back-end. This library automatically handles sending the
//  * CSRF token as a header based on the value of the "XSRF" token cookie.
//  */

// window.axios = require('axios');

// window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// /**
//  * Echo exposes an expressive API for subscribing to channels and listening
//  * for events that are broadcast by Laravel. Echo and event broadcasting
//  * allows your team to easily build robust real-time web applications.
//  */

// // import Echo from 'laravel-echo';

// // window.Pusher = require('pusher-js');

// // window.Echo = new Echo({
// //     broadcaster: 'pusher',
// //     key: process.env.MIX_PUSHER_APP_KEY,
// //     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
// //     forceTLS: true
// // });
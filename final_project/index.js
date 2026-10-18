
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
);

// Authentication middleware for protected customer routes
app.use('/customer/auth/*', function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authorization token required'
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, 'bookreview_secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: 'Invalid or expired token'
      });
    }

    req.user = decoded;
    next();
  });
});

const PORT = 5001;

app.use('/customer', customer_routes);
app.use('/', genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per IP
  message: { message: 'Too many requests from this IP, please try again after a minute' }
});

// Rate limiting for AI routes to control cost
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per user/IP
  message: { message: 'AI request limit reached. Please wait a minute.' }
});

module.exports = { authLimiter, aiLimiter };

import rateLimit from 'express-rate-limit';

// Create a rate limiter that tracks by both IP and API key
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => {
    // Use both the IP address and API key (if present) as the key
    return `${req.ip}:${req.headers['x-api-key'] || 'no-api-key'}`;
  },
  message: 'Too many requests, please try again after 15 minutes'
});

// Middleware to apply rate limiting
export const rateLimitMiddleware = (req, res, next) => {
  limiter(req, res, next);
};
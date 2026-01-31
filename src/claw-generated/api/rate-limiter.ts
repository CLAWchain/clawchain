import rateLimit from 'express-rate-limit';
import { logger, metrics } from '../utils';

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  keyGenerator: (req) => {
    // Track by both IP and API key
    return `${req.ip}:${req.headers['x-api-key'] || 'no-api-key'}`;
  },
  handler: (req, res, next, options) => {
    // Log rate limiting events
    logger.warn(`Rate limit exceeded for ${options.keyGenerator(req)}`);

    // Increment rate limiting metrics
    metrics.increment('api_rate_limit_exceeded');

    res.status(options.statusCode).json({
      error: options.message,
      retryAfter: options.windowMs / 1000, // Seconds
    });
  },
});

export default limiter;
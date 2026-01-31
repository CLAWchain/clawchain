import rateLimit from 'express-rate-limit';

// Custom rate limiter that tracks by both IP and API key
const createApiRateLimiter = () => {
  return rateLimit({
    keyGenerator: (req) => {
      // Generate a unique key based on IP and API key
      return `${req.ip}:${req.get('X-API-Key')}`;
    },
    max: 100, // Limit each key to 100 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
  });
};

export default createApiRateLimiter;
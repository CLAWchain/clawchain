// API routes
import express from 'express';
import createApiRateLimiter from './api-rate-limiter';

const router = express.Router();

// Rate limiter middleware
const limiter = createApiRateLimiter();

// Apply rate limiter to all routes
router.use(limiter);

// Define your API routes here
router.get('/status', (req, res) => {
  res.json({ status: 'OK' });
});

export default router;
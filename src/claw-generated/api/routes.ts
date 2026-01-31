import express from 'express';
import rateLimit from 'express-rate-limit';

// Create a rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const router = express.Router();

// Apply the rate limiter to all requests
router.use(limiter);

// Define public API routes here

export default router;
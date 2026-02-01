import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Create a rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply the rate limiter to all requests
router.use(limiter);

// Define your API routes here
router.get('/hello', (req, res) => {
  res.send('Hello, ClawChain!');
});

export default router;
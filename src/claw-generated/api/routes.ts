import express from 'express';
import limiter from './rate-limiter';

const router = express.Router();

// Apply rate limiting to all public API routes
router.use(limiter);

// Public API routes go here

export default router;
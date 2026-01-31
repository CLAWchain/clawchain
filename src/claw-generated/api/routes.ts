import express from 'express';
import limiter from './rate-limiter';
import healthRouter from './health';

const router = express.Router();

// Apply rate limiting to all public API routes
router.use(limiter);

// Public API routes
router.use(healthRouter);

export default router;
import express from 'express';
import { handleGetStatus } from './status';
import { handleGetTransactions } from './transactions';
import { rateLimit } from './rate-limiter';

const router = express.Router();

// Apply rate limiting to all endpoints
router.use(rateLimit);

router.get('/status', handleGetStatus);
router.get('/transactions', handleGetTransactions);

export default router;
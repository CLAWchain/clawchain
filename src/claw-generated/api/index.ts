import express from 'express';
import { handleGetStatus } from './status';
import { handleGetTransactions } from './transactions';
import { handleGetHealth, handleGetReady } from './health';
import { rateLimit } from './rate-limiter';

const router = express.Router();

// Apply rate limiting to all endpoints
router.use(rateLimit);

router.get('/status', handleGetStatus);
router.get('/transactions', handleGetTransactions);
router.get('/health', handleGetHealth);
router.get('/ready', handleGetReady);

export default router;
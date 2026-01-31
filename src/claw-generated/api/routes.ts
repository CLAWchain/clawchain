import express, { Router } from 'express';
import { healthCheck, readinessCheck } from './health';
import { contractVerification } from './contract-verification';
import { getTransaction } from './transaction';
import { rateLimiter } from './rate-limiter';

const router = Router();

// Health and readiness checks
router.get('/health', healthCheck);
router.get('/ready', readinessCheck);

// Contract verification
router.post('/contract-verification', contractVerification);

// Transaction explorer
router.get('/transactions/:hash', getTransaction);

// Apply rate limiting middleware
router.use(rateLimiter);

export default router;
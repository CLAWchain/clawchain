import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Chain } from '../blockchain/Chain';
import { TransactionPool } from '../blockchain/TransactionPool';
import { BlockProducer } from '../blockchain/BlockProducer';
import { ValidatorManager } from '../validators/ValidatorManager';
import { EventBus } from '../events/EventBus';
import { stateManager } from '../blockchain/StateManager';
import { db, cache } from '../database/db';
import { createTables } from '../database/schema';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

async function main() {
  // ... existing code ...

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each API key to 50 requests per windowMs
    keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
    message: 'Too many requests from this API key or IP, please try again after 15 minutes'
  });

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Apply rate limiting
  app.use('/api', apiLimiter);
  app.use(limiter);

  // ... existing code ...
}
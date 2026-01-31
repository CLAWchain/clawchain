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
import { registerHealthEndpoints } from './health';

dotenv.config();

async function main() {
  // Register health check endpoints
  const chain = new Chain();
  const txPool = new TransactionPool();
  const validatorManager = new ValidatorManager();
  registerHealthEndpoints(app, chain, txPool, validatorManager);

  // Rest of the server setup...

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health check endpoint for Railway
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // API status check (no key exposure)
  app.get('/api/config/status', (req, res) => {
    res.json({
      anthropicKey: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_set'
    });
  });

  // Rest of the API endpoints...
}

main();
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

dotenv.config();

async function main() {
  // ... (existing code)

  app.get('/api/state/balance/:address', (req, res) => {
    const balance = stateManager.getBalance(req.params.address);
    res.json({
      address: req.params.address,
      balance: stateManager.formatBalance(balance),
      balanceRaw: balance.toString()
    });
  });

  app.get('/api/state/getBalance/:address', (req, res) => {
    const balance = stateManager.getBalance(req.params.address);
    res.json({
      address: req.params.address,
      balance: balance.toString()
    });
  });

  // ... (existing code)
}
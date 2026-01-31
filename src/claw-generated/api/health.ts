import { Express } from 'express';
import { Chain } from '../blockchain/Chain';
import { TransactionPool } from '../blockchain/TransactionPool';
import { ValidatorManager } from '../validators/ValidatorManager';
import { stateManager } from '../blockchain/StateManager';

export function registerHealthEndpoints(app: Express, chain: Chain, txPool: TransactionPool, validatorManager: ValidatorManager) {
  // Health check endpoint for container orchestration
  app.get('/health', (req, res) => {
    const chainLength = chain.getChainLength();
    const pendingTxs = txPool.getPendingCount();
    const validators = validatorManager.getAllValidators().length;
    const stateRoot = stateManager.getStateRoot();

    res.status(200).json({
      status: 'healthy',
      chainLength,
      pendingTransactions: pendingTxs,
      validators,
      stateRoot
    });
  });

  // Readiness check endpoint for container orchestration
  app.get('/ready', (req, res) => {
    // Check if the chain is synced and ready to process transactions
    if (chain.getChainLength() > 0 && txPool.getPendingCount() > 0) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not_ready' });
    }
  });
}
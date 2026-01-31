import { Chain } from '../blockchain/Chain';
import { TransactionPool } from '../blockchain/TransactionPool';
import { ValidatorManager } from '../validators/ValidatorManager';

export function initializeHealthChecks(app: any, chain: Chain, txPool: TransactionPool, validatorManager: ValidatorManager) {
  // Health check endpoint for container orchestration
  app.get('/health', (req, res) => {
    // Check if the node is running and able to process transactions
    const isReady = chain.isInitialized() && txPool.isInitialized() && validatorManager.isInitialized();
    res.status(isReady ? 200 : 503).json({ status: isReady ? 'ok' : 'error' });
  });

  // Readiness check endpoint for container orchestration
  app.get('/ready', (req, res) => {
    // Check if the node is fully initialized and ready to handle requests
    const isReady = chain.isInitialized() && txPool.isInitialized() && validatorManager.isInitialized();
    res.status(isReady ? 200 : 503).json({ status: isReady ? 'ok' : 'error' });
  });
}
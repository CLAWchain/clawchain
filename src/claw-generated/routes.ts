import express from 'express';
import rateLimit from 'express-rate-limit';
import { Chain, StateManager } from './chain';
import { TransactionPool } from './TransactionPool';
import { PeerManager } from './peer_manager';

const router = express.Router();

// Create a rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply the rate limiter to all requests
router.use(limiter);

// Define your API routes here
router.get('/hello', (req, res) => {
  res.send('Hello, ClawChain!');
});

// Health check endpoints
router.get('/health', (req, res) => {
  // Check the overall health of the service
  const chain = Chain.getInstance();
  const stateManager = StateManager.getInstance();
  const transactionPool = TransactionPool.getInstance();
  const peerManager = PeerManager.getInstance();

  // Check if the blockchain is synced
  const isSynced = chain.isSynced();

  // Check if the transaction pool is healthy
  const isTransactionPoolHealthy = transactionPool.isHealthy();

  // Check if the network connections are stable
  const isNetworkHealthy = peerManager.isNetworkHealthy();

  if (isSynced && isTransactionPoolHealthy && isNetworkHealthy) {
    res.status(200).send('Healthy');
  } else {
    res.status(503).send('Unhealthy');
  }
});

router.get('/ready', (req, res) => {
  // Check if the service is ready to accept requests
  const chain = Chain.getInstance();
  const stateManager = StateManager.getInstance();
  const transactionPool = TransactionPool.getInstance();
  const peerManager = PeerManager.getInstance();

  // Check if the blockchain is synced
  const isSynced = chain.isSynced();

  // Check if the transaction pool is healthy
  const isTransactionPoolHealthy = transactionPool.isHealthy();

  // Check if the network connections are stable
  const isNetworkHealthy = peerManager.isNetworkHealthy();

  if (isSynced && isTransactionPoolHealthy && isNetworkHealthy) {
    res.status(200).send('Ready');
  } else {
    res.status(503).send('Not Ready');
  }
});

export default router;
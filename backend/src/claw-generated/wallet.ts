import { Router } from 'express';
import { db } from '../database/db';
import crypto from 'crypto';
import { stateManager } from '../blockchain/StateManager';

const walletRouter = Router();

// ... (existing code)

// Get wallet balance
walletRouter.get('/balance/:address', async (req, res) => {
  try {
    const wallet = await getWallet(req.params.address);
    if (wallet) {
      res.json({
        success: true,
        balance: wallet.balance
      });
    } else {
      res.status(404).json({ success: false, error: 'Wallet not found' });
    }
  } catch (error) {
    console.error('[WALLET] Balance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet balance' });
  }
});

export default walletRouter;
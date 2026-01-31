import { Router } from 'express';
import { db } from '../database/db';
import { StateManager } from '../blockchain/StateManager';
import { TransactionReceipt } from '../blockchain/TransactionReceipt';

const CLAW_FAUCET_AMOUNT = 10;
const CLAW_FAUCET_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

const router = Router();

router.post('/faucet', async (req, res) => {
  const { address } = req.body;

  // Check if the address has already received a faucet payout within the cooldown period
  const lastFaucetPayout = await db.getFaucetPayout(address);
  const now = Date.now();
  if (lastFaucetPayout && now - lastFaucetPayout < CLAW_FAUCET_COOLDOWN) {
    return res.status(429).json({
      error: 'Faucet cooldown in effect. You can only request from the faucet once per day.'
    });
  }

  // Mint the CLAW tokens
  const txReceipt = await StateManager.instance.mintTokens(address, CLAW_FAUCET_AMOUNT);

  // Record the faucet payout in the database
  await db.recordFaucetPayout(address, now);

  res.json({
    success: true,
    txReceipt: TransactionReceipt.fromJSON(txReceipt)
  });
});

export default router;
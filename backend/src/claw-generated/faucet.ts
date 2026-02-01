import { Request, Response, Router } from 'express';
import { stateManager } from '../blockchain/StateManager';
import { db } from '../database/db';

const faucetRouter = Router();

faucetRouter.post('/request', async (req: Request, res: Response) => {
  const { address } = req.body;

  // Check if the address has already received a faucet payout in the last 24 hours
  const previousPayout = await db.query<{ timestamp: Date }>(`
    SELECT timestamp 
    FROM faucet_payouts
    WHERE address = $1
    ORDER BY timestamp DESC
    LIMIT 1
  `, [address]);

  if (previousPayout.rows.length > 0 && (Date.now() - previousPayout.rows[0].timestamp.getTime()) < 24 * 60 * 60 * 1000) {
    return res.status(429).json({ error: 'You can only request from the faucet once per day.' });
  }

  // Mint 10 CLAW tokens and send to the address
  const amount = 10n * stateManager.getTokenDecimals();
  await stateManager.mint(address, amount);

  // Record the payout in the database
  await db.query(`
    INSERT INTO faucet_payouts (address, timestamp)
    VALUES ($1, $2)
  `, [address, new Date()]);

  return res.json({ success: true, amount: stateManager.formatBalance(amount) });
});

export { faucetRouter };
import express from 'express';
import { Knex } from 'knex';
import { mintTokens } from './token-minting';

const router = express.Router();

// Faucet API endpoint
router.post('/api/faucet', async (req, res) => {
  try {
    const { address } = req.body;

    // Check if the address has already received tokens today
    const db: Knex = req.app.get('db');
    const existingRequest = await db('faucet_requests')
      .where('address', address)
      .andWhere('requested_at', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .first();

    if (existingRequest) {
      return res.status(429).json({ error: 'You can only request tokens once per day' });
    }

    // Mint and transfer 10 CLAW tokens
    await mintTokens(address, 10);

    // Log the faucet request
    await db('faucet_requests').insert({ address });

    res.status(200).json({ message: 'Tokens dispensed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
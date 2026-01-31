// Faucet API endpoint
import express from 'express';
import { dispenseTokens } from './faucet-logic';

const faucetRouter = express.Router();

faucetRouter.post('/claim', async (req, res) => {
  try {
    const address = req.body.address;
    const tokens = await dispenseTokens(address);
    res.json({ tokens });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default faucetRouter;
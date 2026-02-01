import express from 'express';
import { faucetHandler } from './faucet';

const router = express.Router();

router.post('/faucet', faucetHandler);

export default router;
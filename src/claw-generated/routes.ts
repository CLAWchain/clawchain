import express from 'express';
import faucetRouter from './faucet';

const router = express.Router();

router.use(faucetRouter);

export default router;
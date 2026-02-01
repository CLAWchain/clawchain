import { Router } from 'express';
import { sendTransaction } from './transactions';

const router = Router();

router.post('/transactions', sendTransaction);

export default router;
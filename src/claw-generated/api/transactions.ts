import { Request, Response } from 'express';
import { Transaction } from '@solana/web3.js';

export async function sendTransaction(req: Request, res: Response) {
  try {
    const { signedTransaction } = req.body;
    const transaction = Transaction.from(Buffer.from(signedTransaction, 'base64'));

    // Validate the transaction
    if (!transaction.verifySignatures()) {
      return res.status(400).json({ error: 'Invalid transaction signatures' });
    }

    // Broadcast the transaction to the network
    const signature = await transaction.send();
    res.json({ signature });
  } catch (error) {
    console.error('Error in sendTransaction:', error);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
}
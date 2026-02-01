import request from 'supertest';
import express from 'express';
import { Transaction } from '@solana/web3.js';
import { sendTransaction } from './transactions';

const app = express();
app.use(express.json());
app.post('/transactions', sendTransaction);

describe('sendTransaction', () => {
  it('should accept and validate a signed transaction', async () => {
    const transaction = new Transaction();
    transaction.add({ keys: [], programId: Buffer.alloc(32), data: Buffer.alloc(100) });
    const signature = await transaction.sign([]);
    const signedTransaction = signature.serialize().toString('base64');

    const response = await request(app)
      .post('/transactions')
      .send({ signedTransaction })
      .expect(200);

    expect(response.body).toHaveProperty('signature');
  });

  it('should return an error for an invalid transaction', async () => {
    const response = await request(app)
      .post('/transactions')
      .send({ signedTransaction: 'invalid-base64' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
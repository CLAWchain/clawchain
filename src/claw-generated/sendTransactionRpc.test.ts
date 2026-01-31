import { expect } from 'chai';
import { rpcServer } from './sendTransactionRpc';
import { Transaction } from '../transaction';

describe('sendTransaction RPC', () => {
  it('should accept and validate a signed transaction', async () => {
    const tx = new Transaction({
      nonce: 1,
      to: '0x1234567890abcdef',
      value: 1000,
      data: Buffer.from('hello, world'),
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    });

    const result = await rpcServer.methods.sendTransaction({ signedTransaction: tx.toBase64() });
    expect(result).to.deep.equal({ success: true });
  });

  it('should throw an error for an invalid transaction', async () => {
    const tx = new Transaction({
      nonce: 1,
      to: '0x1234567890abcdef',
      value: 1000,
      data: Buffer.from('hello, world'),
      signature: '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    });

    try {
      await rpcServer.methods.sendTransaction({ signedTransaction: tx.toBase64() });
      expect.fail('Expected an error to be thrown');
    } catch (err) {
      expect(err.message).to.equal('Invalid transaction signature');
    }
  });
});
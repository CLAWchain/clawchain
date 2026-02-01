import { Buffer } from 'buffer';
import nacl from 'tweetnacl';
import Blockchain, { Transaction } from './blockchain';

describe('Blockchain', () => {
  let blockchain: Blockchain;

  beforeEach(() => {
    blockchain = new Blockchain();
  });

  it('should verify valid transactions', () => {
    const keyPair = nacl.sign.keyPair();
    const transaction: Transaction = {
      from: Buffer.from(keyPair.publicKey).toString('hex'),
      to: '0x0123456789012345678901234567890123456789',
      amount: 100,
      signature: Buffer.from(
        nacl.sign.detached(
          Buffer.from(`${keyPair.publicKey.toString('hex')}0x0123456789012345678901234567890123456789100`),
          keyPair.secretKey
        )
      ).toString('hex'),
    };

    expect(blockchain.verifyTransaction(transaction)).toBe(true);
    blockchain.addTransaction(transaction);
    expect(blockchain.mempool.length).toBe(1);
  });

  it('should reject invalid transactions', () => {
    const keyPair = nacl.sign.keyPair();
    const transaction: Transaction = {
      from: Buffer.from(keyPair.publicKey).toString('hex'),
      to: '0x0123456789012345678901234567890123456789',
      amount: 100,
      signature: Buffer.from(
        nacl.sign.detached(
          Buffer.from(`${keyPair.publicKey.toString('hex')}0x0123456789012345678901234567890123456789101`),
          keyPair.secretKey
        )
      ).toString('hex'),
    };

    expect(blockchain.verifyTransaction(transaction)).toBe(false);
    blockchain.addTransaction(transaction);
    expect(blockchain.mempool.length).toBe(0);
  });
});
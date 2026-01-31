import { ethers } from 'ethers';
import { Transaction } from './transaction';
import { StateManager } from '../state/state-manager';

describe('Transaction Validation', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should verify a valid transaction signature', () => {
    const senderAddress = '0x1234567890abcdef';
    const data = 'some transaction data';
    const signature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    expect(Transaction.verifySignature(senderAddress, data, signature)).toBe(true);
  });

  it('should reject a transaction with an invalid signature', () => {
    const senderAddress = '0x1234567890abcdef';
    const data = 'some transaction data';
    const signature = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    expect(Transaction.verifySignature(senderAddress, data, signature)).toBe(false);
  });

  it('should validate a transaction with the correct nonce', async () => {
    const senderAddress = '0x1234567890abcdef';
    const nonce = 42;

    await stateManager.setNonce(senderAddress, nonce);

    expect(await Transaction.validateNonce(senderAddress, nonce, stateManager)).toBe(true);
  });

  it('should reject a transaction with an incorrect nonce', async () => {
    const senderAddress = '0x1234567890abcdef';
    const nonce = 42;
    const wrongNonce = 41;

    await stateManager.setNonce(senderAddress, nonce);

    expect(await Transaction.validateNonce(senderAddress, wrongNonce, stateManager)).toBe(false);
  });

  it('should validate a transaction with sufficient balance', async () => {
    const senderAddress = '0x1234567890abcdef';
    const balance = ethers.utils.parseEther('100.0');
    const amount = ethers.utils.parseEther('50.0');

    await stateManager.setBalance(senderAddress, balance);

    expect(await Transaction.validateBalance(senderAddress, amount, stateManager)).toBe(true);
  });

  it('should reject a transaction with insufficient balance', async () => {
    const senderAddress = '0x1234567890abcdef';
    const balance = ethers.utils.parseEther('100.0');
    const amount = ethers.utils.parseEther('150.0');

    await stateManager.setBalance(senderAddress, balance);

    expect(await Transaction.validateBalance(senderAddress, amount, stateManager)).toBe(false);
  });
});
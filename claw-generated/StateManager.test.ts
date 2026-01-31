import { describe, it, expect } from 'vitest';
import { StateManager } from './StateManager';
import { Account, Transaction } from '../src/types';

describe('StateManager', () => {
  it('should update account balances correctly', () => {
    const stateManager = new StateManager();
    stateManager.updateBalance('0x123', 100);
    stateManager.updateBalance('0x456', 50);

    expect(stateManager.getAccount('0x123')).toEqual({ balance: 100, nonce: 0 });
    expect(stateManager.getAccount('0x456')).toEqual({ balance: 50, nonce: 0 });
  });

  it('should update account nonces correctly', () => {
    const stateManager = new StateManager();
    stateManager.updateNonce('0x123', 5);
    stateManager.updateNonce('0x456', 3);

    expect(stateManager.getAccount('0x123')).toEqual({ balance: 0, nonce: 5 });
    expect(stateManager.getAccount('0x456')).toEqual({ balance: 0, nonce: 3 });
  });

  it('should calculate the state root correctly', () => {
    const stateManager = new StateManager();
    stateManager.updateBalance('0x123', 100);
    stateManager.updateBalance('0x456', 50);

    const stateRoot = stateManager.calculateStateRoot();
    expect(stateRoot).not.toEqual('');
  });

  it('should apply transactions correctly', () => {
    const stateManager = new StateManager();
    stateManager.updateBalance('0x123', 100);
    stateManager.updateNonce('0x123', 0);

    const tx: Transaction = {
      from: '0x123',
      to: '0x456',
      value: 50,
      nonce: 0,
      gasLimit: 21000,
      gasPrice: 10,
    };

    const receipt = stateManager.applyTransaction(tx);
    expect(receipt.status).toEqual('success');
    expect(stateManager.getAccount('0x123')).toEqual({ balance: 50, nonce: 1 });
    expect(stateManager.getAccount('0x456')).toEqual({ balance: 50, nonce: 0 });
  });
});
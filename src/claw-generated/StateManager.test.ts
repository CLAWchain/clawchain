import { StateManager } from './StateManager';
import { Account, Transaction } from '../types';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should update account balances correctly', () => {
    const address1 = '0x123456789';
    const address2 = '0x987654321';

    stateManager.updateAccountBalance(address1, 100);
    stateManager.updateAccountBalance(address2, 50);

    expect(stateManager.getAccountBalance(address1)).toBe(100);
    expect(stateManager.getAccountBalance(address2)).toBe(50);
  });

  it('should calculate the state root correctly', () => {
    const address1 = '0x123456789';
    const address2 = '0x987654321';

    stateManager.updateAccountBalance(address1, 100);
    stateManager.updateAccountBalance(address2, 50);

    const stateRoot = stateManager.getStateRoot();
    expect(stateRoot).not.toBeEmpty();
  });

  it('should apply transactions correctly', () => {
    const sender = '0x123456789';
    const receiver = '0x987654321';

    stateManager.updateAccountBalance(sender, 100);
    stateManager.updateAccountBalance(receiver, 50);

    const tx: Transaction = {
      from: sender,
      to: receiver,
      value: 20,
      nonce: 0,
      gasLimit: 21000,
      gasPrice: 1,
    };

    stateManager.applyTransaction(tx);

    expect(stateManager.getAccountBalance(sender)).toBe(80);
    expect(stateManager.getAccountBalance(receiver)).toBe(70);
  });
});
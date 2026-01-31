import { StateManager } from './StateManager';
import { Account } from '../models/Account';
import { TransactionReceipt } from '../models/TransactionReceipt';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should update account balances', () => {
    const address1 = Buffer.from('address1');
    const address2 = Buffer.from('address2');

    stateManager.updateBalance(address1, 100n);
    stateManager.updateBalance(address2, 50n);

    const account1 = stateManager.getAccount(address1);
    const account2 = stateManager.getAccount(address2);

    expect(account1.balance).toEqual(100n);
    expect(account2.balance).toEqual(50n);
  });

  it('should calculate the state root correctly', () => {
    const address1 = Buffer.from('address1');
    const address2 = Buffer.from('address2');

    stateManager.updateBalance(address1, 100n);
    stateManager.updateBalance(address2, 50n);

    const stateRoot = stateManager.getStateRoot();
    expect(stateRoot).not.toEqual(Buffer.alloc(32));
  });

  it('should apply transactions correctly', () => {
    const address1 = Buffer.from('address1');
    const address2 = Buffer.from('address2');

    const tx1: TransactionReceipt = {
      from: address1,
      to: address2,
      value: 50n,
    };

    stateManager.updateBalance(address1, 100n);
    stateManager.applyTransaction(tx1);

    const account1 = stateManager.getAccount(address1);
    const account2 = stateManager.getAccount(address2);

    expect(account1.balance).toEqual(50n);
    expect(account2.balance).toEqual(50n);
  });
});
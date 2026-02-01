import { StateManager } from './StateManager';
import { Account, AccountState } from './account-state';
import { MerklePatriciaTrie } from './merkle-trie';
import { Transaction } from './transaction/transaction';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should update account balances', () => {
    const address = '0x1234567890abcdef';
    const initialBalance = 100;
    stateManager.updateAccountBalance(address, initialBalance);
    expect(stateManager.getAccountBalance(address)).toBe(initialBalance);

    const newBalance = 50;
    stateManager.updateAccountBalance(address, newBalance);
    expect(stateManager.getAccountBalance(address)).toBe(newBalance);
  });

  it('should calculate the correct state root', () => {
    // TODO: Write test case
  });

  it('should apply transactions correctly', () => {
    // TODO: Write test case
  });
});
import { StateManager } from '../../src/state/StateManager';
import { Account } from '../../src/account/Account';
import { Transaction } from '../../src/transaction/Transaction';
import { BlockHeader } from '../../src/block/BlockHeader';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  it('should update balances correctly', async () => {
    const address1 = '0x1234567890abcdef';
    const address2 = '0x0987654321fedcba';

    await stateManager.updateBalance(address1, 100);
    await stateManager.updateBalance(address2, 50);

    expect(await stateManager.getBalance(address1)).toBe(100);
    expect(await stateManager.getBalance(address2)).toBe(50);
  });

  it('should calculate the state root correctly', async () => {
    const address1 = '0x1234567890abcdef';
    const address2 = '0x0987654321fedcba';

    await stateManager.updateBalance(address1, 100);
    await stateManager.updateBalance(address2, 50);

    const stateRoot = await stateManager.getStateRoot();
    expect(stateRoot).not.toBeEmpty();
  });

  it('should apply transactions correctly', async () => {
    const sender = '0x1234567890abcdef';
    const receiver = '0x0987654321fedcba';
    const tx = new Transaction({
      from: sender,
      to: receiver,
      value: 50,
      nonce: 0,
    });

    await stateManager.updateBalance(sender, 100);
    await stateManager.applyTransaction(tx, new BlockHeader());

    expect(await stateManager.getBalance(sender)).toBe(50);
    expect(await stateManager.getBalance(receiver)).toBe(50);
  });
});
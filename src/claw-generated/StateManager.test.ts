import { StateManager, AccountState } from './StateManager';
import { Transaction } from './Block';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
    stateManager.initialize();
  });

  describe('balance updates', () => {
    it('should update balances correctly when applying a transaction', async () => {
      const sender = '0x1234567890abcdef';
      const recipient = '0x0987654321fedcba';
      const senderInitialBalance = 1000n;
      const recipientInitialBalance = 100n;
      const txValue = 50n;
      const txGasPrice = 10n;
      const txGasLimit = 21000n;

      // Set up initial account states
      stateManager.accounts.set(sender, { address: sender, balance: senderInitialBalance, nonce: 0 });
      stateManager.accounts.set(recipient, { address: recipient, balance: recipientInitialBalance, nonce: 0 });

      // Create a transaction
      const tx: Transaction = {
        from: sender,
        to: recipient,
        value: txValue,
        gasPrice: txGasPrice,
        gasLimit: txGasLimit,
        nonce: 0,
        hash: 'tx_hash'
      };

      // Apply the transaction
      await stateManager.applyTransaction(tx, 1);

      // Verify balances
      const senderAccount = stateManager.getAccount(sender);
      const recipientAccount = stateManager.getAccount(recipient);

      expect(senderAccount?.balance).toEqual(senderInitialBalance - txValue - (txGasPrice * txGasLimit));
      expect(recipientAccount?.balance).toEqual(recipientInitialBalance + txValue);
    });
  });

  // Add more test cases here
});
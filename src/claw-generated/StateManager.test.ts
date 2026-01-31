import { StateManager } from './StateManager';
import { Account, Block, Transaction } from '../types';

describe('StateManager', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('updateBalance', () => {
    it('should update the balance of an account', () => {
      const address = '0x123';
      stateManager.updateBalance(address, 100);
      const account = stateManager.getAccount(address);
      expect(account.balance).toBe(100);
    });
  });

  describe('applyTransaction', () => {
    it('should update the balances and nonce correctly', () => {
      const senderAddress = '0x123';
      const receiverAddress = '0x456';
      stateManager.updateBalance(senderAddress, 1000);
      stateManager.updateBalance(receiverAddress, 0);

      const tx: Transaction = {
        from: senderAddress,
        to: receiverAddress,
        value: 100,
        nonce: 0,
        signature: 'TODO'
      };

      stateManager.applyTransaction(tx);

      const senderAccount = stateManager.getAccount(senderAddress);
      const receiverAccount = stateManager.getAccount(receiverAddress);

      expect(senderAccount.balance).toBe(900);
      expect(senderAccount.nonce).toBe(1);
      expect(receiverAccount.balance).toBe(100);
    });
  });

  describe('applyBlock', () => {
    it('should apply all transactions in a block', () => {
      const address1 = '0x123';
      const address2 = '0x456';
      const address3 = '0x789';

      stateManager.updateBalance(address1, 1000);
      stateManager.updateBalance(address2, 0);
      stateManager.updateBalance(address3, 0);

      const tx1: Transaction = {
        from: address1,
        to: address2,
        value: 100,
        nonce: 0,
        signature: 'TODO'
      };

      const tx2: Transaction = {
        from: address1,
        to: address3,
        value: 200,
        nonce: 1,
        signature: 'TODO'
      };

      const block: Block = {
        transactions: [tx1, tx2]
      };

      stateManager.applyBlock(block);

      const account1 = stateManager.getAccount(address1);
      const account2 = stateManager.getAccount(address2);
      const account3 = stateManager.getAccount(address3);

      expect(account1.balance).toBe(700);
      expect(account1.nonce).toBe(2);
      expect(account2.balance).toBe(100);
      expect(account3.balance).toBe(200);
    });
  });

  describe('getStateRoot', () => {
    it('should return the current state root', () => {
      const stateRoot = stateManager.getStateRoot();
      expect(stateRoot).toBe('TODO');
    });
  });
});
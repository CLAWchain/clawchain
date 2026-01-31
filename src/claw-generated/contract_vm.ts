import { Account, ContractStorage, Transaction } from '../types';

export class ContractVM {
  private accounts: Account[];
  private storage: ContractStorage;

  constructor(accounts: Account[], storage: ContractStorage) {
    this.accounts = accounts;
    this.storage = storage;
  }

  executeContract(tx: Transaction): void {
    // Implement contract execution logic

    // Handle CALL opcode
    if (tx.opcode === 'CALL') {
      try {
        this.handleCall(tx);
      } catch (err) {
        // Revert the caller's account changes
        const callerAccount = this.accounts.find(a => a.address === tx.from);
        if (callerAccount) {
          callerAccount.balance += tx.gas;
        }

        // Propagate the error
        throw err;
      }
    }
  }

  private handleCall(tx: Transaction): void {
    // Get the address of the contract to call
    const calleeAddress = tx.params[0];

    // Get the caller's account
    const callerAccount = this.accounts.find(a => a.address === tx.from);
    if (!callerAccount) {
      throw new Error(`Caller account not found: ${tx.from}`);
    }

    // Get the callee's account
    const calleeAccount = this.accounts.find(a => a.address === calleeAddress);
    if (!calleeAccount) {
      throw new Error(`Callee account not found: ${calleeAddress}`);
    }

    // Check if the callee is a contract account
    if (!calleeAccount.isContract) {
      throw new Error(`${calleeAddress} is not a contract account`);
    }

    // Deduct gas from the caller's balance
    const gasUsed = tx.gas;
    callerAccount.balance -= gasUsed;

    // Execute the callee's contract code
    try {
      calleeAccount.contract.execute(tx.params[1], tx.params[2]);
    } catch (err) {
      // Revert the caller's account changes
      callerAccount.balance += gasUsed;
      throw err;
    }

    // Refund any unused gas to the caller
    callerAccount.balance += gasUsed - tx.gas;
  }
}
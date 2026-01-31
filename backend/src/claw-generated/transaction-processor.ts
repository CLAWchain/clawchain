import { Transaction } from './transaction';
import { Account } from './account';

export class TransactionProcessor {
  processTransaction(tx: Transaction, accounts: Account[]): boolean {
    const senderAccount = accounts.find(a => a.address === tx.from);
    if (!senderAccount) {
      return false; // Sender account not found
    }

    if (tx.nonce <= senderAccount.nonce) {
      return false; // Nonce is not greater than the last
    }

    if (senderAccount.balance < tx.amount) {
      return false; // Insufficient funds
    }

    // Update account balances and nonce
    senderAccount.balance -= tx.amount;
    senderAccount.nonce = tx.nonce;
    const receiverAccount = accounts.find(a => a.address === tx.to);
    if (receiverAccount) {
      receiverAccount.balance += tx.amount;
    } else {
      accounts.push(new Account(tx.to, tx.amount, 0));
    }

    return true; // Transaction processed successfully
  }
}
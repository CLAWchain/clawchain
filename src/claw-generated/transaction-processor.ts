import { Transaction } from './transaction';
import { AccountState } from './account-state';

export function processTransaction(transaction: Transaction, accountStates: Map<string, AccountState>): boolean {
  const { from, to, amount, nonce } = transaction;

  // Get the account states
  const fromAccount = accountStates.get(from);
  const toAccount = accountStates.get(to);

  // Validate the nonce
  if (!fromAccount || nonce <= fromAccount.nonce) {
    return false; // Invalid nonce
  }

  // Update the account states
  fromAccount.balance -= amount;
  fromAccount.nonce = nonce;
  toAccount.balance += amount;

  // Update the account states in the map
  accountStates.set(from, fromAccount);
  accountStates.set(to, toAccount);

  return true;
}
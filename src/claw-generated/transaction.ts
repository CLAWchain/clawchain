import { Account } from './account';
import { NonceTracker } from './nonce-tracker';

export class Transaction {
  sender: Account;
  recipient: Account;
  amount: number;
  nonce: number;

  constructor(sender: Account, recipient: Account, amount: number, nonce: number) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.nonce = nonce;
  }

  async validate(nonceTracker: NonceTracker): Promise<boolean> {
    const expectedNonce = await nonceTracker.getNonce(this.sender);
    return this.nonce === expectedNonce;
  }

  async process(nonceTracker: NonceTracker): Promise<void> {
    // Validate the transaction
    if (await this.validate(nonceTracker)) {
      // Deduct funds from sender
      this.sender.balance -= this.amount;
      // Add funds to recipient
      this.recipient.balance += this.amount;
      // Increment the sender's nonce
      await nonceTracker.incrementNonce(this.sender);
    } else {
      throw new Error('Invalid transaction nonce');
    }
  }
}
export class Transaction {
  sender: string;
  recipient: string;
  amount: number;
  nonce: number;

  constructor(sender: string, recipient: string, amount: number, nonce: number) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.nonce = nonce;
  }

  validate(): boolean {
    // TODO: Implement validation logic
    return true;
  }
}
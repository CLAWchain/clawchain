export class Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  nonce: number;
  signature: string;

  constructor(
    from: string,
    to: string,
    amount: number,
    timestamp: number,
    nonce: number,
    signature: string
  ) {
    this.id = this.generateId();
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.signature = signature;
  }

  private generateId(): string {
    // Implement transaction ID generation logic
    return 'tx_' + Math.random().toString(36).substring(2, 10);
  }
}
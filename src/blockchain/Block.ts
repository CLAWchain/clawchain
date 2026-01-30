import crypto from 'crypto';

export class Block {
  version: number;
  previousHash: string;
  timestamp: number;
  transactions: any[];
  nonce: number;
  hash: string;

  constructor(
    version: number,
    previousHash: string,
    timestamp: number,
    transactions: any[],
    nonce: number,
    hash: string
  ) {
    this.version = version;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = nonce;
    this.hash = hash;
  }

  validate(): boolean {
    // Validate block structure
    if (
      typeof this.version !== 'number' ||
      typeof this.previousHash !== 'string' ||
      typeof this.timestamp !== 'number' ||
      !Array.isArray(this.transactions) ||
      typeof this.nonce !== 'number' ||
      typeof this.hash !== 'string'
    ) {
      return false;
    }

    // Validate timestamp
    const currentTime = Date.now() / 1000;
    if (this.timestamp > currentTime + 600 || this.timestamp < currentTime - 600) {
      return false;
    }

    // Validate transaction data
    for (const tx of this.transactions) {
      // Implement transaction validation logic
    }

    // Validate hash
    if (this.hash !== this.calculateHash()) {
      return false;
    }

    return true;
  }

  serialize(): string {
    return JSON.stringify({
      version: this.version,
      previousHash: this.previousHash,
      timestamp: this.timestamp,
      transactions: this.transactions,
      nonce: this.nonce,
      hash: this.hash
    });
  }

  deserialize(data: string): Block {
    const { version, previousHash, timestamp, transactions, nonce, hash } = JSON.parse(data);
    return new Block(version, previousHash, timestamp, transactions, nonce, hash);
  }

  calculateHash(): string {
    const data = `${this.version}${this.previousHash}${this.timestamp}${JSON.stringify(this.transactions)}${this.nonce}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
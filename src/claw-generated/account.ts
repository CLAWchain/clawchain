import { MerklePatriciaTrie } from '../trie/trie';

export class Account {
  public address: string;
  public balance: number;
  public transactionHistory: Transaction[];

  constructor(address: string, balance: number) {
    this.address = address;
    this.balance = balance;
    this.transactionHistory = [];
  }

  public addTransaction(tx: Transaction) {
    this.transactionHistory.push(tx);
    this.updateBalance(tx);
  }

  private updateBalance(tx: Transaction) {
    if (tx.from === this.address) {
      this.balance -= tx.amount;
    } else if (tx.to === this.address) {
      this.balance += tx.amount;
    }
  }
}

export class Transaction {
  public from: string;
  public to: string;
  public amount: number;
  public timestamp: number;
  public blockNumber: number;

  constructor(from: string, to: string, amount: number, timestamp: number, blockNumber: number) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.timestamp = timestamp;
    this.blockNumber = blockNumber;
  }
}
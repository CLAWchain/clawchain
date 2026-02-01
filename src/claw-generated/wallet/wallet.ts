import { ChainState } from '../chain-state';
import { Block } from '../chain';

export class Wallet {
  // Properties for storing account balance and transaction history
  private balance: number;
  private transactions: Transaction[];

  constructor(private address: string, private chainState: ChainState) {
    this.balance = 0;
    this.transactions = [];
  }

  async getBalance(): Promise<number> {
    // Fetch balance from chain state
    this.balance = await this.fetchBalance();
    return this.balance;
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    // Fetch transaction history from chain
    this.transactions = await this.fetchTransactions();
    return this.transactions;
  }

  private async fetchBalance(): Promise<number> {
    // Fetch balance from chain state
    return await this.chainState.getAccountBalance(this.address);
  }

  private async fetchTransactions(): Promise<Transaction[]> {
    // Fetch transaction history from chain
    const blocks = await this.chainState.getAllBlocks();
    const transactions: Transaction[] = [];

    for (const block of blocks) {
      for (const tx of block.transactions) {
        if (tx.from === this.address || tx.to === this.address) {
          transactions.push({
            hash: tx.hash,
            blockHeight: block.height,
            timestamp: block.timestamp,
            amount: tx.amount,
            pending: tx.pending
          });
        }
      }
    }

    return transactions;
  }
}

interface Transaction {
  hash: string;
  blockHeight: number;
  timestamp: number;
  amount: number;
  pending: boolean;
}
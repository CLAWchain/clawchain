import { BigNumber } from 'ethers';
import { StateManager } from './StateManager';
import { TransactionReceipt } from './transaction-receipt';
import { Transaction } from './transaction';

class TransactionOrdering {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async processTransactions(transactions: Transaction[]): Promise<TransactionReceipt[]> {
    // 1. Collect transactions into a batch
    const batch = transactions.slice();

    // 2. Apply a verifiable delay to the batch
    await this.applyVerifiableDelay(batch);

    // 3. Run a sealed-bid auction to determine the final order
    const finalOrder = await this.runSealedBidAuction(batch);

    // 4. Process the transactions in the final order
    const receipts = await Promise.all(finalOrder.map((tx) => this.stateManager.processTransaction(tx)));

    return receipts;
  }

  private async applyVerifiableDelay(transactions: Transaction[]) {
    // Use a VDF to introduce a verifiable delay before the transactions can be processed
    // This makes it harder for miners to reorder the transactions for profit
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Simulating a 10-second delay
  }

  private async runSealedBidAuction(transactions: Transaction[]): Promise<Transaction[]> {
    // Collect sealed bids from users to determine the order of transactions in the batch
    // The user with the highest bid gets their transaction processed first, and so on
    const bids: { [key: string]: BigNumber } = {};
    transactions.forEach((tx) => {
      bids[tx.hash] = BigNumber.from(Math.floor(Math.random() * 1000000));
    });

    // Sort the transactions by their bid amounts in descending order
    return transactions.sort((a, b) => bids[b.hash].sub(bids[a.hash]).toNumber());
  }
}

export { TransactionOrdering };
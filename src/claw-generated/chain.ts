import { AbstractAccount } from './abstract-account';
import { Block } from './block';
import { TransactionPool } from './transaction-pool';

export class Chain {
  private blocks: Block[] = [];
  private accounts: Map<string, AbstractAccount> = new Map();
  private transactionPool: TransactionPool = new TransactionPool();

  addBlock(block: Block): boolean {
    // Process the transactions in the block
    for (const tx of block.transactions) {
      const sender = this.getAccount(tx.from);
      if (!sender.validateTransaction(tx)) {
        return false;
      }

      // Update the sender and recipient accounts
      sender.nonce++;
      sender.balance -= BigInt(tx.value);
      const recipient = this.getAccount(tx.to);
      recipient.balance += BigInt(tx.value);
    }

    // Add the block to the chain
    this.blocks.push(block);
    return true;
  }

  getAccount(address: string): AbstractAccount {
    let account = this.accounts.get(address);
    if (!account) {
      account = new AbstractAccount();
      this.accounts.set(address, account);
    }
    return account;
  }

  getTransactionPool(): TransactionPool {
    return this.transactionPool;
  }
}
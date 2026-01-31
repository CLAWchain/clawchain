import { Account } from "./account";
import { Transaction } from "./transaction";
import { VM, ContractState } from "./vm";

class Chain {
  private blocks: Block[] = [];
  private transactionPool: Transaction[] = [];
  private accountState: Map<string, Account> = new Map();

  addBlock(block: Block): void {
    // Validate the block
    if (!this.isBlockValid(block)) {
      throw new Error("Invalid block");
    }

    // Update the chain
    this.blocks.push(block);

    // Update the account state
    block.transactions.forEach(tx => {
      this.updateAccountState(tx);
    });

    // Clear the transaction pool
    this.transactionPool = this.transactionPool.filter(tx => {
      return !block.transactions.includes(tx);
    });
  }

  private isBlockValid(block: Block): boolean {
    // Check the block header
    // Check the transactions
    // Check the merkle root
    return true;
  }

  private updateAccountState(tx: Transaction): void {
    let fromAccount = this.getAccount(tx.from.address);
    let toAccount = this.getAccount(tx.to.address);

    fromAccount.balance -= tx.amount;
    fromAccount.nonce++;

    toAccount.balance += tx.amount;

    this.accountState.set(tx.from.address, fromAccount);
    this.accountState.set(tx.to.address, toAccount);
  }

  private getAccount(address: string): Account {
    if (!this.accountState.has(address)) {
      this.accountState.set(address, new Account());
    }
    return this.accountState.get(address)!;
  }

  revertChain(newChain: Block[]): void {
    // Revert the transactions from the old chain
    this.blocks.forEach(block => {
      block.transactions.forEach(tx => {
        this.revertTransaction(tx);
      });
    });

    // Update the chain to the new longer chain
    this.blocks = newChain;

    // Replay the transactions from the new chain
    newChain.forEach(block => {
      block.transactions.forEach(tx => {
        this.updateAccountState(tx);
      });
    });

    // Update the transaction pool
    this.updateTransactionPool();
  }

  private revertTransaction(tx: Transaction): void {
    let fromAccount = this.getAccount(tx.from.address);
    let toAccount = this.getAccount(tx.to.address);

    fromAccount.balance += tx.amount;
    fromAccount.nonce--;

    toAccount.balance -= tx.amount;

    this.accountState.set(tx.from.address, fromAccount);
    this.accountState.set(tx.to.address, toAccount);
  }

  private updateTransactionPool(): void {
    // Remove any transactions that are now invalid on the new chain
    // Add any new valid transactions to the pool
  }
}

class Block {
  header: BlockHeader;
  transactions: Transaction[];
  contractStates: Map<string, ContractState>;

  constructor(
    header: BlockHeader,
    transactions: Transaction[],
    contractStates: Map<string, ContractState>
  ) {
    this.header = header;
    this.transactions = transactions;
    this.contractStates = contractStates;
  }
}

class BlockHeader {
  parentHash: string;
  timestamp: number;
  merkleRoot: string;
}
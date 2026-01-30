import { Block, Transaction } from './Block';

export class VirtualMachine {
  private chain: Block[] = [];
  private transactionPool: Transaction[] = [];

  constructor() {
    // Initialize the chain with a genesis block
    this.chain.push(
      new Block(
        '0x1234abcd',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        [],
        Date.now(),
        100,
        0
      )
    );
  }

  addTransaction(transaction: Transaction) {
    this.transactionPool.push(transaction);
  }

  addBlock(block: Block) {
    // Validate the block
    if (this.isValidBlock(block)) {
      this.chain.push(block);
      // Remove any transactions from the pool that are included in the new block
      this.transactionPool = this.transactionPool.filter(
        (tx) => !block.transactions.some((btx) => btx.hash === tx.hash)
      );
    } else {
      throw new Error('Invalid block');
    }
  }

  private isValidBlock(block: Block): boolean {
    // Implement block validation logic here
    return true;
  }

  async reorganizeChain(longerChain: Block[]) {
    // 1. Revert the current chain to the common ancestor
    const commonAncestorIndex = this.findCommonAncestor(this.chain, longerChain);
    const revertedChain = this.chain.slice(0, commonAncestorIndex + 1);

    // 2. Replay the transactions from the new longer chain
    for (let i = commonAncestorIndex + 1; i < longerChain.length; i++) {
      const block = longerChain[i];
      await this.replayBlock(block);
    }

    // 3. Update the chain and transaction pool
    this.chain = longerChain;
    this.transactionPool = this.transactionPool.filter((tx) =>
      !longerChain.some((b) => b.transactions.some((t) => t.hash === tx.hash))
    );
  }

  private async replayBlock(block: Block) {
    // Replay the transactions in the block
    for (const tx of block.transactions) {
      try {
        await this.executeTransaction(tx);
      } catch (err) {
        console.error(`Error executing transaction ${tx.hash}: ${err.message}`);
      }
    }
  }

  private async executeTransaction(tx: Transaction) {
    // Check if there is enough gas
    if (tx.gas < this.getGasRequired(tx)) {
      throw new Error('Insufficient gas');
    }

    // Execute the transaction and update the state
    // ...

    // Deduct the gas used
    tx.gas -= this.getGasRequired(tx);
  }

  private getGasRequired(tx: Transaction): number {
    let gasRequired = 21000; // Base transaction cost

    // Add cost for data/code size
    gasRequired += tx.data.length * 4; 

    // Add cost for storage operations
    // ...

    // Add cost for computation operations
    // ...

    return gasRequired;
  }

  private findCommonAncestor(
    chain1: Block[],
    chain2: Block[]
  ): number {
    let i = 0;
    while (i < chain1.length && i < chain2.length && chain1[i].hash === chain2[i].hash) {
      i++;
    }
    return i - 1;
  }
}
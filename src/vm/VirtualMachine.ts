import { Block, Transaction } from './Block';
import { Contract } from '../core/contract';

export class VirtualMachine {
  private chain: Block[] = [];
  private transactionPool: Transaction[] = [];
  private contracts: Map&lt;Hash, Contract&gt; = new Map();

  constructor() {
    // Initialize the chain with a genesis block
    this.chain.push(Block.createGenesis());
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
      // Execute the transactions in the new block
      this.executeBlockTransactions(block);
    } else {
      throw new Error('Invalid block');
    }
  }

  private async executeBlockTransactions(block: Block) {
    for (const tx of block.transactions) {
      await this.executeTransaction(tx);
    }
  }

  private async executeTransaction(tx: Transaction) {
    // Check if the transaction is a contract deployment
    if (tx.to === null) {
      const contract = await this.deployContract(tx);
      this.contracts.set(contract.address, contract);
    } else {
      // Execute the transaction against the target contract
      const contract = this.contracts.get(tx.to);
      if (contract) {
        await contract.call(tx.data.functionName, tx.data.args);
      } else {
        throw new Error(`Contract at ${tx.to} does not exist`);
      }
    }
  }

  private async deployContract(tx: Transaction): Promise&lt;Contract&gt; {
    // Implement contract deployment logic
    return new Contract(tx.hash, tx.data.code, new Map());
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
    await this.executeBlockTransactions(block);
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
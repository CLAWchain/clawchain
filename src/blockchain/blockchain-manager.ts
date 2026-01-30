import { Block } from './block';
import { Transaction } from './transaction';
import { RewardManager } from './reward-manager';
import { MerklePatriciaTrie } from '../state/merkle_patricia_trie';

export class BlockchainManager {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];
  private maxBlockSize: number = 1000000; // 1 MB
  private blockSizeAdjustmentInterval: number = 10; // Adjust every 10 blocks
  private rewardManager: RewardManager;
  private stateTrie: MerklePatriciaTrie = new MerklePatriciaTrie();

  constructor() {
    this.rewardManager = new RewardManager();
  }

  addTransaction(transaction: Transaction): void {
    this.pendingTransactions.push(transaction);
  }

  async mineBlock(): Promise<Block> {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : '',
      this.genesisConfig
    );

    if (!newBlock.validateSize(this.maxBlockSize)) {
      throw new Error('Block size exceeds maximum limit');
    }

    // Validate and process any uncle blocks
    this.processUncleBlocks(newBlock);

    // Process the block and update the state trie
    await this.processBlock(newBlock);

    this.chain.push(newBlock);
    this.pendingTransactions = [];

    if (this.chain.length % this.blockSizeAdjustmentInterval === 0) {
      this.adjustBlockSize();
    }

    // Reward the miner and any uncle block miners
    this.rewardManager.rewardBlock(newBlock);

    return newBlock;
  }

  getChain(): Block[] {
    return this.chain;
  }

  private async processBlock(block: Block): Promise<void> {
    // Process the block's transactions and update the state trie
    for (const tx of block.transactions) {
      await this.processTransaction(tx);
    }

    // Generate and store the state diff for this block
    const diff = await this.stateTrie.getDiff();
    block.stateDiff = diff;
  }

  private async processTransaction(tx: Transaction): Promise<void> {
    // Process the transaction and update the state trie
    await this.stateTrie.set(tx.from, await this.stateTrie.get(tx.from) - tx.value);
    await this.stateTrie.set(tx.to, (await this.stateTrie.get(tx.to)) + tx.value);
  }

  private adjustBlockSize(): void {
    // Calculate the average block size over the last X blocks
    const lastBlocks = this.chain.slice(-this.blockSizeAdjustmentInterval);
    const averageBlockSize = lastBlocks.reduce((sum, block) => sum + block.size, 0) / lastBlocks.length;

    // Adjust the max block size based on the average
    this.maxBlockSize = Math.max(100000, Math.floor(averageBlockSize * 1.2)); // Increase by 20%
  }

  private processUncleBlocks(newBlock: Block): void {
    // Validate and add any uncle blocks to the new block
    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];
      if (block.number === newBlock.number - 1 && block.parentHash === newBlock.parentHash) {
        newBlock.addUncle(block, i);
      }
    }
  }
}

class RewardManager {
  rewardBlock(block: Block): void {
    // Implement reward calculation and distribution logic
    console.log(`Rewarding miner and uncles for block ${block.number}`);
  }
}
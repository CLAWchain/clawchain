import { Block } from './block';
import { BlockChain } from './blockchain';

export class BlockValidator {
  private readonly blockchain: BlockChain;

  constructor(blockchain: BlockChain) {
    this.blockchain = blockchain;
  }

  public validateBlock(block: Block): boolean {
    // Check block size
    if (block.size > this.blockchain.maxBlockSize) {
      console.error(`Block at index ${block.index} exceeds the maximum size of ${this.blockchain.maxBlockSize} bytes.`);
      return false;
    }

    // Check other validation rules here...

    return true;
  }
}
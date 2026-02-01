export const MAX_BLOCK_SIZE = 1000000; // 1 MB
export const MIN_BLOCK_SIZE = 100000; // 100 KB

export class Block {
  constructor(
    public index: number,
    public timestamp: number,
    public data: any,
    public previousHash: string,
    public hash: string,
    public isUncle: boolean = false
  ) {
    this.validateBlockSize();
    this.validateUncleBlock();
  }

  private validateBlockSize() {
    const blockSize = JSON.stringify(this).length;
    if (blockSize > MAX_BLOCK_SIZE) {
      throw new Error(`Block size (${blockSize} bytes) exceeds maximum of ${MAX_BLOCK_SIZE} bytes`);
    }

    // Adjust block size limit based on network conditions
    if (blockSize > MAX_BLOCK_SIZE * 0.8) {
      MAX_BLOCK_SIZE = Math.max(MAX_BLOCK_SIZE * 1.1, MIN_BLOCK_SIZE);
    } else if (blockSize < MAX_BLOCK_SIZE * 0.5) {
      MAX_BLOCK_SIZE = Math.max(MAX_BLOCK_SIZE * 0.9, MIN_BLOCK_SIZE);
    }
  }

  private validateUncleBlock() {
    // Check if the block is an uncle block
    if (this.isUncle) {
      // Perform additional validation checks for uncle blocks
      // e.g., ensure the block meets the uncle block difficulty, timestamp, etc.
      // Throw an error if the uncle block is invalid
    }
  }
}
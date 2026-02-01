export const MAX_BLOCK_SIZE = 1000000; // 1 MB
export const MIN_BLOCK_SIZE = 100000; // 100 KB

export class Block {
  constructor(
    public index: number,
    public timestamp: number,
    public data: any,
    public previousHash: string,
    public hash: string
  ) {
    this.validateBlockSize();
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
}
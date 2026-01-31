import { Block } from '../blockchain/Block';
import { LZ4 } from 'lz4-wasm';

class StateSnapshot {
  blockNumber: number;
  stateRoot: string;
  stateChanges: Map<string, any>;
  compressedData: Uint8Array;

  constructor(blockNumber: number, stateRoot: string) {
    this.blockNumber = blockNumber;
    this.stateRoot = stateRoot;
    this.stateChanges = new Map();
    this.compressedData = new Uint8Array();
  }

  applyBlock(block: Block) {
    // Track changes to the state for this block
    block.transactions.forEach(tx => {
      tx.stateChanges.forEach((change, address) => {
        this.stateChanges.set(address, change);
      });
    });

    // Compress the state changes
    this.compressedData = this.compressStateChanges();
  }

  getDiff(other: StateSnapshot): Map<string, any> {
    const diff = new Map();
    for (const [address, change] of this.stateChanges) {
      if (!other.stateChanges.has(address) || other.stateChanges.get(address) !== change) {
        diff.set(address, change);
      }
    }
    return diff;
  }

  private compressStateChanges(): Uint8Array {
    // Use LZ4 compression to compress the state changes
    const stateChangesJson = JSON.stringify(Object.fromEntries(this.stateChanges));
    return LZ4.compress(stateChangesJson);
  }

  decompress(): Map<string, any> {
    // Decompress the state changes
    const stateChangesJson = LZ4.decompress(this.compressedData);
    return new Map(Object.entries(JSON.parse(stateChangesJson)));
  }
}

export { StateSnapshot };
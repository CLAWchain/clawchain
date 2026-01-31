import { Blockchain } from '../blockchain';
import { Peer } from '../network';

class BlockSync {
  private blockchain: Blockchain;
  private peers: Peer[];

  constructor(blockchain: Blockchain, peers: Peer[]) {
    this.blockchain = blockchain;
    this.peers = peers;
  }

  async syncBlocks() {
    // 1. Identify missing blocks from the local chain
    const missingBlocks = await this.getMissingBlocks();

    // 2. Request missing blocks from peers in parallel
    await this.requestBlocks(missingBlocks);

    // 3. Verify and persist downloaded blocks
    await this.processBlocks(missingBlocks);
  }

  private async getMissingBlocks(): Promise<number[]> {
    const localChain = await this.blockchain.getChain();
    const missingBlocks: number[] = [];

    for (let i = 1; i <= localChain.length; i++) {
      if (localChain[i - 1]?.number !== i) {
        missingBlocks.push(i);
      }
    }

    return missingBlocks;
  }

  private async requestBlocks(blockNumbers: number[]): Promise<void> {
    const promises = blockNumbers.map(async (blockNumber) => {
      for (const peer of this.peers) {
        try {
          const block = await peer.getBlock(blockNumber);
          if (block) {
            await this.blockchain.addBlock(block);
            console.log(`Downloaded and added block ${blockNumber} from peer ${peer.id}`);
            return;
          }
        } catch (error) {
          console.error(`Error fetching block ${blockNumber} from peer ${peer.id}: ${error}`);
        }
      }
      console.error(`Failed to download block ${blockNumber} from any peers`);
    });

    await Promise.all(promises);
  }

  private async processBlocks(blockNumbers: number[]): Promise<void> {
    for (const blockNumber of blockNumbers) {
      const block = await this.blockchain.getBlock(blockNumber);
      if (block) {
        // Verify block integrity (e.g., check Merkle root)
        if (await this.blockchain.verifyBlock(block)) {
          await this.blockchain.persistBlock(block);
          console.log(`Verified and persisted block ${blockNumber}`);
        } else {
          console.error(`Block ${blockNumber} failed integrity check`);
        }
      } else {
        console.error(`Block ${blockNumber} not found in local chain`);
      }
    }
  }
}

export { BlockSync };
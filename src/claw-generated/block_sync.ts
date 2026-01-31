import { Peer } from './peer';
import { Block, BlockHeader } from './block';
import { BlockValidator } from './block-validator';
import { TransactionProcessor } from './transaction-processor';

class BlockSyncManager {
  private peers: Peer[] = [];
  private missingBlocks: BlockHeader[] = [];

  addPeer(peer: Peer) {
    this.peers.push(peer);
  }

  requestMissingBlocks() {
    for (const peer of this.peers) {
      peer.requestBlocks(this.missingBlocks);
    }
  }

  async handleBlockResponse(peer: Peer, blocks: Block[]) {
    for (const block of blocks) {
      // Verify the block
      if (await BlockValidator.validateBlock(block)) {
        // Process the transactions in the block
        for (const tx of block.transactions) {
          await TransactionProcessor.processTransaction(tx);
        }

        // Remove the block from the missing blocks list
        this.missingBlocks = this.missingBlocks.filter((header) => !header.equals(block.header));
      } else {
        console.error(`Invalid block received from peer: ${peer.id}`);
      }
    }
  }

  markBlocksMissing(headers: BlockHeader[]) {
    this.missingBlocks.push(...headers);
  }
}

export { BlockSyncManager };
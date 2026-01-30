import { PeerManager } from './peer_manager';
import { Peer } from './peer';
import { Block } from '../blockchain/block';
import { BlockchainManager } from '../blockchain/blockchain_manager';

export class BlockSyncManager {
  private peerManager: PeerManager;
  private blockchainManager: BlockchainManager;

  constructor(peerManager: PeerManager, blockchainManager: BlockchainManager) {
    this.peerManager = peerManager;
    this.blockchainManager = blockchainManager;
  }

  async syncBlocks() {
    const localHeight = this.blockchainManager.getLatestBlock().height;
    const peers = this.peerManager.getPeers();

    for (const peer of peers) {
      const peerHeight = await peer.getBlockHeight();
      if (peerHeight > localHeight) {
        const missingBlockNumbers = this.getMissingBlockNumbers(localHeight, peerHeight);
        await this.downloadBlocks(peer, missingBlockNumbers);
      }
    }
  }

  private getMissingBlockNumbers(localHeight: number, peerHeight: number): number[] {
    const missingBlockNumbers = [];
    for (let i = localHeight + 1; i <= peerHeight; i++) {
      missingBlockNumbers.push(i);
    }
    return missingBlockNumbers;
  }

  private async downloadBlocks(peer: Peer, blockNumbers: number[]) {
    const blocks: Block[] = [];
    for (const blockNumber of blockNumbers) {
      const block = await peer.getBlock(blockNumber);
      blocks.push(block);
    }
    await this.blockchainManager.addBlocks(blocks);
  }
}
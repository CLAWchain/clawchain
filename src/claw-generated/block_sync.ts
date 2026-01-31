import { Block } from '../blockchain/block';
import { Peer } from '../network/peer';
import { LocalChain } from '../blockchain/local_chain';

export class BlockSync {
  private peers: Peer[];
  private missingBlocks: Block[];
  private localChain: LocalChain;

  constructor(peers: Peer[], localChain: LocalChain) {
    this.peers = peers;
    this.missingBlocks = [];
    this.localChain = localChain;
  }

  async sync() {
    await this.detectMissingBlocks();
    await this.downloadMissingBlocks();
    await this.verifyAndIntegrateBlocks();
  }

  private async detectMissingBlocks() {
    const localHeight = this.localChain.getLatestBlock().height;

    for (const peer of this.peers) {
      const peerHeight = await peer.getLatestBlockHeight();
      if (peerHeight > localHeight) {
        const missingBlockRange = Array.from({ length: peerHeight - localHeight }, (_, i) => i + localHeight + 1);
        this.missingBlocks.push(...(await peer.getBlocks(missingBlockRange)));
      }
    }
  }

  private async downloadMissingBlocks() {
    const downloadQueue = new Set(this.missingBlocks.map(b => b.height));
    const downloadedBlocks = new Map<number, Block>();

    while (downloadQueue.size > 0) {
      const downloadTasks = [];
      for (const peer of this.peers) {
        const missingHeight = Array.from(downloadQueue).find(h => h <= peer.getLatestBlockHeight());
        if (missingHeight) {
          downloadTasks.push(peer.getBlock(missingHeight).then(b => {
            downloadQueue.delete(b.height);
            downloadedBlocks.set(b.height, b);
          }));
        }
      }
      await Promise.all(downloadTasks);
    }

    this.missingBlocks = Array.from(downloadedBlocks.values());
  }

  private async verifyAndIntegrateBlocks() {
    for (const block of this.missingBlocks) {
      if (await this.localChain.verifyBlock(block)) {
        await this.localChain.addBlock(block);
      } else {
        console.error(`Failed to verify block ${block.height}`);
      }
    }
  }
}
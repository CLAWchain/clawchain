import PeerDiscoveryServer from './peer_discovery';
import { Block, Transaction } from '../core/types';
import { hash, getMerkleRoot } from '../core/utils';

class BlockPropagationManager {
  private peerDiscovery: PeerDiscoveryServer;

  constructor() {
    this.peerDiscovery = new PeerDiscoveryServer();
  }

  broadcastBlock(block: Block) {
    const blockDiff = this.getCompactBlockDiff(block);
    this.peerDiscovery.broadcastToPeers(blockDiff);
  }

  private getCompactBlockDiff(block: Block): string {
    const { header, transactions } = block;
    const transactionHashes = transactions.map(tx => hash(tx));
    const merkleRoot = getMerkleRoot(transactionHashes);

    const compactBlock = {
      header: {
        hash: header.hash,
        timestamp: header.timestamp,
        merkleRoot
      },
      transactionHashes
    };

    return JSON.stringify(compactBlock);
  }
}

export default BlockPropagationManager;
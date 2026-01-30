import { Peer } from './peer';
import { Block } from '../state/block';
import { BlockchainManager } from '../state/blockchain_manager';

export class BlockSyncManager {
  private peers: Peer[];
  private blockchainManager: BlockchainManager;
  private missingBlockHashes: string[];
  private inFlightRequests: Map<string, Promise<Block>>;

  constructor(peers: Peer[], blockchainManager: BlockchainManager) {
    this.peers = peers;
    this.blockchainManager = blockchainManager;
    this.missingBlockHashes = [];
    this.inFlightRequests = new Map();
  }

  async syncBlocks() {
    // Fetch the latest block hash from the blockchain manager
    const latestBlockHash = await this.blockchainManager.getLatestBlockHash();

    // Get the list of missing block hashes
    this.missingBlockHashes = await this.blockchainManager.getMissingBlockHashes(latestBlockHash);

    // Request the missing blocks from peers in parallel
    await this.requestMissingBlocks();

    // Wait for all requests to complete
    await Promise.all(this.inFlightRequests.values());

    // Process the downloaded blocks
    await this.processDownloadedBlocks();
  }

  private async requestMissingBlocks() {
    for (const hash of this.missingBlockHashes) {
      for (const peer of this.peers) {
        if (peer.connected) {
          const request = peer.requestBlocks([hash]);
          this.inFlightRequests.set(hash, request);
          try {
            await request;
          } catch (error) {
            console.error(`Error requesting block ${hash} from peer ${peer.id}: ${error}`);
            this.inFlightRequests.delete(hash);
          }
        }
      }
    }
  }

  private async processDownloadedBlocks() {
    for (const [hash, blockPromise] of this.inFlightRequests) {
      const block = await blockPromise;
      await this.blockchainManager.addBlock(block);
      this.inFlightRequests.delete(hash);
    }
  }
}
import { PeerManager } from './peer_manager';
import { Block } from '../blockchain/block';
import { Transaction } from '../transaction/transaction';
import { Crypto } from '../crypto/index';
import { Chain } from '../blockchain/chain';
import { BlockSyncManager } from '../block-sync-manager';

export class BlockPropagator {
  private peerManager: PeerManager;
  private chain: Chain;
  private blockSyncManager: BlockSyncManager;

  constructor(peerManager: PeerManager, chain: Chain, blockSyncManager: BlockSyncManager) {
    this.peerManager = peerManager;
    this.chain = chain;
    this.blockSyncManager = blockSyncManager;
  }

  propagateBlock(block: Block) {
    // Create a compact representation of the block
    const compactBlock = this.createCompactBlock(block);

    // Select and prioritize the peers to broadcast to
    const peersToPropagate = this.selectPeersForPropagation(block);

    // Broadcast the compact block to the selected peers
    peersToPropagate.forEach(peer => peer.sendCompactBlock(compactBlock));
  }

  private createCompactBlock(block: Block): any {
    // Serialize the block header in a compact format
    const compactHeader = this.serializeBlockHeader(block.header);

    // Extract the transaction hashes and serialize them in a compact format
    const compactTxHashes = block.transactions.map(tx => this.serializeTransactionHash(tx.hash));

    return {
      header: compactHeader,
      txHashes: compactTxHashes
    };
  }

  private serializeBlockHeader(header: any): Uint8Array {
    // Implement compact serialization of the block header
    // e.g., using binary encoding or delta encoding
    const { version, prevHash, merkleRoot, timestamp, difficulty, nonce } = header;
    return new Uint8Array([
      version,
      ...Crypto.hexToBytes(prevHash),
      ...Crypto.hexToBytes(merkleRoot),
      ...Crypto.numberToBytes(timestamp, 8),
      ...Crypto.numberToBytes(difficulty, 4),
      ...Crypto.numberToBytes(nonce, 8)
    ]);
  }

  private serializeTransactionHash(hash: string): Uint8Array {
    // Implement compact serialization of the transaction hash
    // e.g., using delta encoding or a custom binary format
    return Crypto.hexToBytes(hash);
  }

  private selectPeersForPropagation(block: Block): any[] {
    // Implement peer selection and prioritization logic
    // Consider factors like peer latency, bandwidth, and reputation
    return this.peerManager.getConnectedPeers();
  }

  private handleForkResolution(newBlock: Block) {
    // Implement fork resolution logic
    // Check if the new block extends the current chain or represents a fork
    // If it's a fork, request the missing blocks and switch to the new chain if necessary
    if (this.chain.isValidBlock(newBlock)) {
      this.chain.addBlock(newBlock);
    } else {
      this.blockSyncManager.requestMissingBlocks(newBlock);
    }
  }

  private handleStaleBlocks(newBlock: Block) {
    // Implement stale block handling logic
    // Check if the new block is stale compared to the current chain
    // If it's stale, ignore the block or request the latest blocks
    if (newBlock.timestamp < this.chain.getLatestBlock().timestamp) {
      // Ignore the stale block
    } else {
      this.blockSyncManager.requestLatestBlocks();
    }
  }
}
import { PeerManager } from '../networking/peer_manager';
import { DatabaseService } from '../storage/database';
import { BlockSyncManager } from './block_sync';

async function main() {
  // Initialize dependencies
  const peerManager = new PeerManager();
  const database = new DatabaseService();

  // Create and initialize the BlockSyncManager
  const blockSyncManager = new BlockSyncManager(peerManager, database);

  // Start the block sync process
  await blockSyncManager.syncBlocks();

  // Other application logic goes here...
}

main();
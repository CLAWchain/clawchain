import { PeerManager } from '../networking/peer_manager';
import { DatabaseService } from '../storage/database';
import { BlockSyncManager } from './block_sync';
import { RPCServer } from './rpc';
import { StateManager } from './state';

async function main() {
  // Initialize dependencies
  const peerManager = new PeerManager();
  const database = new DatabaseService();
  const stateManager = new StateManager(database);

  // Create and initialize the BlockSyncManager
  const blockSyncManager = new BlockSyncManager(peerManager, database);

  // Create and start the RPC server
  const rpcServer = new RPCServer(stateManager);
  await rpcServer.start();

  // Start the block sync process
  await blockSyncManager.syncBlocks();

  // Other application logic goes here...
}

main();
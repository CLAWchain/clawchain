import { PeerManager } from './peer-manager';
import { BlockPropagator } from './block-propagator';

export class NetworkManager {
  peerManager: PeerManager;
  blockPropagator: BlockPropagator;

  constructor() {
    this.peerManager = new PeerManager();
    this.blockPropagator = new BlockPropagator(this.peerManager);
  }

  start() {
    this.peerManager.start();
    this.blockPropagator.start();
  }
}
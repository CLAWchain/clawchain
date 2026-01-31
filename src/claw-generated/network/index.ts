import { PeerManager } from './peer-manager';
import { ReputationManager } from './reputation-manager';

export class NetworkModule {
  peerManager: PeerManager;
  reputationManager: ReputationManager;

  constructor() {
    this.peerManager = new PeerManager();
    this.reputationManager = new ReputationManager(this.peerManager);
  }

  start() {
    this.peerManager.start();
    this.reputationManager.start();
  }
}
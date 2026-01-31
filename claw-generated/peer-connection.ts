import { PeerReputation } from './peer-reputation';

class PeerConnection {
  id: string;
  reputation: PeerReputation;

  constructor(id: string) {
    this.id = id;
    this.reputation = new PeerReputation();
    this.reputation.addPeer(this);
  }

  disconnect() {
    this.reputation.removePeer(this);
  }

  adjustReputation(delta: number) {
    this.reputation.adjustReputation(this, delta);
  }

  getReputation(): number {
    return this.reputation.getPeerReputation(this);
  }
}

export { PeerConnection };
import { PeerInfo } from './PeerManager';

class PeerReputation {
  private peerReputations: Map<string, PeerReputationScore> = new Map();
  private reputationThreshold = 50;
  private banThreshold = 20;

  constructor() {
    // Initialize peer reputations
  }

  addPeer(peerInfo: PeerInfo) {
    // Add new peer with default reputation
    this.peerReputations.set(peerInfo.id, {
      responseTime: 100,
      messageIntegrity: 100,
      protocolAdherence: 100,
      overallScore: 100,
    });
  }

  updateReputation(peerId: string, responseTime: number, messageIntegrity: number, protocolAdherence: number) {
    // Update reputation score for a peer
    const currentReputationScore = this.peerReputations.get(peerId) || {
      responseTime: 100,
      messageIntegrity: 100,
      protocolAdherence: 100,
      overallScore: 100,
    };

    const newResponseTime = this.updateMetric(currentReputationScore.responseTime, responseTime, 0.2);
    const newMessageIntegrity = this.updateMetric(currentReputationScore.messageIntegrity, messageIntegrity, 0.3);
    const newProtocolAdherence = this.updateMetric(currentReputationScore.protocolAdherence, protocolAdherence, 0.5);

    const newOverallScore = (newResponseTime + newMessageIntegrity + newProtocolAdherence) / 3;

    this.peerReputations.set(peerId, {
      responseTime: newResponseTime,
      messageIntegrity: newMessageIntegrity,
      protocolAdherence: newProtocolAdherence,
      overallScore: newOverallScore,
    });
  }

  getPeerReputation(peerId: string): PeerReputationScore {
    // Get the current reputation score for a peer
    return this.peerReputations.get(peerId) || {
      responseTime: 100,
      messageIntegrity: 100,
      protocolAdherence: 100,
      overallScore: 100,
    };
  }

  getBestPeers(count: number): PeerInfo[] {
    // Return the top `count` peers by reputation
    const sortedPeers = Array.from(this.peerReputations.entries())
      .filter(([, score]) => score.overallScore >= this.reputationThreshold)
      .sort(([, a], [, b]) => b.overallScore - a.overallScore)
      .map(([id]) => this.getPeerInfo(id));
    return sortedPeers.slice(0, count);
  }

  banPeer(peerId: string) {
    // Ban a peer if their reputation falls below the threshold
    if (this.peerReputations.has(peerId) && this.peerReputations.get(peerId)?.overallScore < this.banThreshold) {
      this.peerReputations.delete(peerId);
    }
  }

  private updateMetric(currentValue: number, newValue: number, weight: number): number {
    // Update a single reputation metric with a given weight
    return currentValue * (1 - weight) + newValue * weight;
  }

  private getPeerInfo(peerId: string): PeerInfo {
    // Retrieve the PeerInfo object for a given peer ID
    // (this would be provided by the PeerManager class)
    const reputationScore = this.getPeerReputation(peerId);
    return { id: peerId, reputation: reputationScore.overallScore };
  }
}

interface PeerReputationScore {
  responseTime: number;
  messageIntegrity: number;
  protocolAdherence: number;
  overallScore: number;
}

export { PeerReputation, PeerReputationScore };
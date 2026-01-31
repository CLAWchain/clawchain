export class PeerInfo {
  id: string;
  address: string;
  reputationScore: number;

  constructor(id: string, address: string) {
    this.id = id;
    this.address = address;
    this.reputationScore = 0;
  }
}
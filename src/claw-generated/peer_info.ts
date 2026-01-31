import { PeerReputation } from './peer_reputation';

export class PeerInfo {
  id: string;
  address: string;
  port: number;
  reputation: PeerReputation;

  constructor(id: string, address: string, port: number) {
    this.id = id;
    this.address = address;
    this.port = port;
    this.reputation = new PeerReputation();
  }
}
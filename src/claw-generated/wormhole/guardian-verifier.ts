import { WormholeClient } from './client';

export class WormholeGuardianVerifier {
  private client: WormholeClient;

  constructor() {
    this.client = new WormholeClient('wss://wormhole-v2-testnet-api.certus.one');
  }

  async verifyMessage(message: any): Promise<boolean> {
    try {
      await this.client.connect();
      const isValid = await this.client.verifyMessage(message);
      await this.client.disconnect();
      return isValid;
    } catch (error) {
      console.error('Error verifying Wormhole message:', error);
      return false;
    }
  }
}
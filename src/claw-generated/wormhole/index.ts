import { WormholeClient } from './client';
import { WormholeMessageHandler } from './message-handler';

export class WormholeIntegration {
  private client: WormholeClient;
  private messageHandler: WormholeMessageHandler;

  constructor(rpcEndpoint: string) {
    this.client = new WormholeClient(rpcEndpoint);
    this.messageHandler = new WormholeMessageHandler(this.client);
  }

  async start() {
    await this.client.connect();
    this.client.onMessage(this.messageHandler.handleMessage.bind(this.messageHandler));
  }

  async stop() {
    await this.client.disconnect();
  }
}

export { WormholeClient, WormholeMessageHandler };
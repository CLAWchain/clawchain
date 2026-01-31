// src/claw-generated/wormhole/index.ts
import { WormholeClient } from './client';
import { WormholeMessageHandler } from './message-handler';

export class WormholeModule {
  private client: WormholeClient;
  private messageHandler: WormholeMessageHandler;

  constructor() {
    this.client = new WormholeClient();
    this.messageHandler = new WormholeMessageHandler(this.client);
  }

  async start() {
    await this.client.connect();
    this.messageHandler.start();
  }

  async stop() {
    this.messageHandler.stop();
    await this.client.disconnect();
  }
}
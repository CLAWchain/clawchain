// src/claw-generated/wormhole/client.ts
import { Connection, PublicKey } from '@solana/web3.js';
import { Provider, Program, web3 } from '@project-serum/anchor';
import { WormholeProgram } from './wormhole-program';

export class WormholeClient {
  private provider: Provider;
  private program: Program<WormholeProgram>;

  constructor() {
    this.provider = Provider.local();
    this.program = new Program<WormholeProgram>(WormholeProgram, this.provider);
  }

  async connect() {
    await this.provider.connection.connect();
  }

  async disconnect() {
    await this.provider.connection.disconnect();
  }

  async sendMessage(message: Buffer, targetChain: number, targetAddress: PublicKey) {
    await this.program.rpc.sendMessage(message, targetChain, targetAddress, {
      accounts: {
        // Wormhole accounts
      },
    });
  }

  async receiveMessage(messageId: Buffer): Promise<Buffer> {
    const message = await this.program.account.message.fetch(new PublicKey(messageId));
    return message.payload;
  }
}
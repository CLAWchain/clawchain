import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { parseEventData, processMessageFromOtherChain } from '@certusone/wormhole-sdk';

class WormholeBridge {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async processIncomingMessages() {
    // Listen for incoming messages from the Wormhole network
    const messages = await this.connection.getParsedProgramAccounts(
      new PublicKey('wormhole_program_id')
    );

    for (const { account } of messages) {
      const { data } = account;
      const parsedData = parseEventData(data);

      // Process the incoming message
      await processMessageFromOtherChain(
        this.connection,
        parsedData,
        // Pass any necessary ClawChain-specific logic here
      );
    }
  }

  async sendMessageToOtherChain(transaction: Transaction) {
    // Encode the transaction and send it to the Wormhole network
    await this.connection.sendRawTransaction(transaction.serialize());
  }
}

export default WormholeBridge;
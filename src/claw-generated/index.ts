import { Connection } from '@solana/web3.js';
import WormholeBridge from './wormhole';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const wormholeBridge = new WormholeBridge(connection);

async function processWormholeMessages() {
  // Start processing incoming Wormhole messages
  await wormholeBridge.processIncomingMessages();
}

async function sendMessageToWormhole() {
  // Send a test message to the Wormhole network
  const tx = new Transaction();
  // Add your ClawChain-specific transaction logic here
  await wormholeBridge.sendMessageToOtherChain(tx);
}

export {
  WormholeBridge,
  processWormholeMessages,
  sendMessageToWormhole
};
import { WormholeMessage, verifyWormholeMessage, parseWormholeMessage } from '@certusone/wormhole-sdk';
import { Chain } from '../blockchain/Chain';
import { TransactionProcessor } from '../transaction/TransactionProcessor';
import { StateManager } from '../state/StateManager';

export class WormholeMessageHandler {
  constructor(
    private chain: Chain,
    private transactionProcessor: TransactionProcessor,
    private stateManager: StateManager
  ) {}

  async handleMessage(message: WormholeMessage): Promise<void> {
    // Verify the message
    const isValid = await verifyWormholeMessage(message);
    if (!isValid) {
      throw new Error('Invalid Wormhole message');
    }

    // Process the message
    await this.processMessage(message);
  }

  private async processMessage(message: WormholeMessage): Promise<void> {
    // Parse the message content
    const parsedMessage = await parseWormholeMessage(message);

    // Handle different message types
    switch (parsedMessage.type) {
      case 'transfer':
        await this.handleTransferMessage(parsedMessage);
        break;
      case 'governance':
        await this.handleGovernanceMessage(parsedMessage);
        break;
      case 'attestation':
        await this.handleAttestationMessage(parsedMessage);
        break;
      default:
        console.log('Unhandled Wormhole message type:', parsedMessage.type);
    }
  }

  private async handleTransferMessage(message: WormholeMessage): Promise<void> {
    // Extract transfer details from the message
    const { amount, tokenAddress, sender, recipient } = message.transfer;

    // Process the token transfer on ClawChain
    await this.transactionProcessor.processTokenTransfer(
      tokenAddress,
      sender,
      recipient,
      amount
    );

    // Update the ClawChain state
    await this.stateManager.updateBalances(sender, recipient, amount);
  }

  private async handleGovernanceMessage(message: WormholeMessage): Promise<void> {
    // Extract governance details from the message
    const { proposal, voter, vote } = message.governance;

    // Process the governance action on ClawChain
    await this.chain.processGovernanceAction(proposal, voter, vote);
  }

  private async handleAttestationMessage(message: WormholeMessage): Promise<void> {
    // Extract attestation details from the message
    const { attestation } = message;

    // Process the attestation on ClawChain
    await this.stateManager.processAttestation(attestation);
  }
}
import { BigNumber } from 'ethers';
import { StateChannelManager } from './state-channel-manager';
import { Chain } from '../chain';
import { Transaction } from '../transaction';

class StateChannelChainIntegration {
  private stateChannelManager: StateChannelManager;
  private chain: Chain;

  constructor(stateChannelManager: StateChannelManager, chain: Chain) {
    this.stateChannelManager = stateChannelManager;
    this.chain = chain;
  }

  async processStateChannelTransaction(tx: Transaction): Promise<void> {
    const { channelId, newBalance1, newBalance2, newSequenceNumber } = tx.data;
    const channel = this.stateChannelManager.getChannel(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const newState = channel.updateState(
      BigNumber.from(newBalance1),
      BigNumber.from(newBalance2),
      newSequenceNumber
    );

    // Validate the new state before committing it
    await this.validateChannelState(newState);

    // Commit the new state to the channel
    this.stateChannelManager.updateChannelState(
      channelId,
      newState.balance1,
      newState.balance2,
      newState.sequenceNumber
    );
  }

  async validateChannelState(state: ChannelState): Promise<void> {
    // Perform validation checks on the new channel state
    // e.g., verify the sequence number, check balances, etc.
    // Throw an error if the state is invalid
  }
}

export { StateChannelChainIntegration };
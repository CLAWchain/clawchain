import { BigNumber } from 'ethers';
import { StateChannelManager, StateChannel } from './state-channel';

class StateChannelAPI {
  private channelManager: StateChannelManager;

  constructor() {
    this.channelManager = new StateChannelManager();
  }

  createChannel(participants: string[], initialBalance: BigNumber): StateChannel {
    return this.channelManager.createChannel(participants, initialBalance);
  }

  closeChannel(channelId: string): void {
    this.channelManager.closeChannel(channelId);
  }

  updateChannelBalance(channelId: string, newBalance: BigNumber): void {
    this.channelManager.updateChannelBalance(channelId, newBalance);
  }
}

export { StateChannelAPI };
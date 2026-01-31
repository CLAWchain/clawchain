import { BigNumber, ethers } from 'ethers';
import { StateChannel, StateChannelParams } from './StateChannel';

class StateChannelManager {
  private channels: Map<string, StateChannel> = new Map();
  private mainChainContract: ethers.Contract;

  constructor(mainChainContract: ethers.Contract) {
    this.mainChainContract = mainChainContract;
  }

  openChannel(params: StateChannelParams): StateChannel {
    const channel = new StateChannel(params);
    this.channels.set(params.channelId, channel);

    // Deposit funds into the main chain contract
    this.mainChainContract.deposit(
      params.channelId,
      params.participant1,
      params.participant2,
      params.depositAmount
    );

    return channel;
  }

  closeChannel(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    channel.closeChannel();
    this.channels.delete(channelId);

    // Notify the main chain contract of the channel closure
    this.mainChainContract.closeChannel(channelId);
  }
}

export { StateChannelManager };
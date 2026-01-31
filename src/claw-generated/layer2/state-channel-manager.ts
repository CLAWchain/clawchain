import { BigNumber, ethers } from 'ethers';
import { StateChannel, ChannelState } from './channel';
import { ClawChainContract } from '../contract';

class StateChannelManager {
  private channels: Map<string, StateChannel> = new Map();
  private clawChainContract: ClawChainContract;

  constructor(clawChainContract: ClawChainContract) {
    this.clawChainContract = clawChainContract;
  }

  async openChannel(
    participant1: string,
    participant2: string,
    initialBalance1: BigNumber,
    initialBalance2: BigNumber
  ): Promise<string> {
    const channelId = await this.clawChainContract.openChannel(
      participant1,
      participant2,
      initialBalance1,
      initialBalance2
    );
    const channel = new StateChannel(
      channelId,
      participant1,
      participant2,
      initialBalance1,
      initialBalance2
    );
    this.channels.set(channelId, channel);
    return channelId;
  }

  getChannel(channelId: string): StateChannel | undefined {
    return this.channels.get(channelId);
  }

  updateChannelState(
    channelId: string,
    newBalance1: BigNumber,
    newBalance2: BigNumber,
    newSequenceNumber: number
  ): ChannelState {
    const channel = this.getChannel(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }
    return channel.updateState(newBalance1, newBalance2, newSequenceNumber);
  }

  async closeChannel(channelId: string): Promise<void> {
    const channel = this.getChannel(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }
    await this.clawChainContract.closeChannel(
      channel.getState().participant1,
      channel.getState().participant2,
      channel.getState().balance1,
      channel.getState().balance2,
      channel.getState().sequenceNumber
    );
    this.channels.delete(channelId);
  }
}

export { StateChannelManager };
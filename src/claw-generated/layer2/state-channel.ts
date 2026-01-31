import { BigNumber } from 'ethers';

interface StateChannel {
  id: string;
  participants: string[];
  balance: BigNumber;
  lastUpdateBlock: number;
  isOpen: boolean;
}

class StateChannelManager {
  private channels: StateChannel[] = [];

  createChannel(participants: string[], initialBalance: BigNumber): StateChannel {
    const channel: StateChannel = {
      id: this.generateChannelId(),
      participants,
      balance: initialBalance,
      lastUpdateBlock: 0,
      isOpen: true
    };
    this.channels.push(channel);
    return channel;
  }

  closeChannel(channelId: string): void {
    const channel = this.getChannel(channelId);
    if (channel) {
      channel.isOpen = false;
    }
  }

  updateChannelBalance(channelId: string, newBalance: BigNumber): void {
    const channel = this.getChannel(channelId);
    if (channel) {
      channel.balance = newBalance;
      channel.lastUpdateBlock = this.getCurrentBlockNumber();
    }
  }

  private generateChannelId(): string {
    // Generate a unique channel ID
    return 'channel-' + Math.random().toString(36).substring(2, 10);
  }

  private getChannel(channelId: string): StateChannel | undefined {
    return this.channels.find(channel => channel.id === channelId);
  }

  private getCurrentBlockNumber(): number {
    // Placeholder, will need to integrate with ClawChain node
    return 12345;
  }
}

export { StateChannelManager, StateChannel };
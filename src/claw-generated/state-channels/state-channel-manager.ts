import { Wallet } from '../wallet';
import { StateChannel } from './state-channel';

export class StateChannelManager {
  private channels: StateChannel[] = [];

  openChannel(participant1: Wallet, participant2: Wallet, depositAmount: number): StateChannel {
    const channel = new StateChannel([participant1, participant2], depositAmount);
    this.channels.push(channel);
    return channel;
  }

  getChannel(participants: [Wallet, Wallet]): StateChannel | undefined {
    return this.channels.find(
      (channel) =>
        (channel.participants[0] === participants[0] && channel.participants[1] === participants[1]) ||
        (channel.participants[0] === participants[1] && channel.participants[1] === participants[0])
    );
  }

  closeChannel(channel: StateChannel): Transaction {
    const index = this.channels.indexOf(channel);
    if (index !== -1) {
      this.channels.splice(index, 1);
    }
    return channel.closeChannel();
  }
}
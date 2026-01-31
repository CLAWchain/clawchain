import { StateChannel, StateChannelUpdate } from './state-channel';
import { Transaction, TransactionManager } from './transaction';
import { State } from './state';

class StateChannelManager {
  private channels: Map<string, StateChannel> = new Map();
  private transactionManager: TransactionManager;
  private state: State;

  constructor(transactionManager: TransactionManager, state: State) {
    this.transactionManager = transactionManager;
    this.state = state;
  }

  openChannel(participants: string[]): StateChannel {
    const channelId = this.generateChannelId(participants);
    const channel = new StateChannel(channelId, participants.map(p => Buffer.from(p, 'hex')));
    this.channels.set(channelId, channel);
    return channel;
  }

  getChannel(channelId: string): StateChannel | undefined {
    return this.channels.get(channelId);
  }

  handleStateUpdate(update: StateChannelUpdate): boolean {
    const channel = this.getChannel(update.channelId);
    if (!channel) {
      return false;
    }

    if (channel.applyUpdate(update)) {
      // Update the on-chain state to reflect the channel state change
      this.updateOnChainState(channel);
      return true;
    }

    return false;
  }

  closeChannel(channelId: string): Transaction {
    const channel = this.getChannel(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }

    const finalTransaction = channel.closeChannel();
    this.transactionManager.addTransaction(finalTransaction);
    this.channels.delete(channelId);
    return finalTransaction;
  }

  private generateChannelId(participants: string[]): string {
    return participants.sort().join('-');
  }

  private updateOnChainState(channel: StateChannel): void {
    // Update the on-chain state to reflect the channel state change
    for (const participant of channel.participants) {
      // Update the participant's account balance, nonce, etc.
      this.state.updateAccountState(participant, channel.state);
    }

    this.state.commitState();
  }
}

export { StateChannelManager };
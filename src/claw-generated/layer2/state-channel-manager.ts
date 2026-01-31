import { StateChannel } from './state-channel';
import { Transaction } from '../transaction/transaction';
import { Account } from '../account/account';

export class StateChannelManager {
  private channels: Map<string, StateChannel> = new Map();

  /**
   * Create a new state channel between two parties.
   * @param initiator The initiating party's account
   * @param counterparty The counterparty's account
   * @param initialDeposit The initial deposit amount for the channel
   * @returns The newly created state channel
   */
  createChannel(
    initiator: Account,
    counterparty: Account,
    initialDeposit: number
  ): StateChannel {
    const channelId = this.generateChannelId(initiator, counterparty);
    const channel = new StateChannel(channelId, initiator, counterparty, initialDeposit);
    this.channels.set(channelId, channel);
    return channel;
  }

  /**
   * Get an existing state channel by its ID.
   * @param channelId The unique identifier for the channel
   * @returns The state channel instance, or undefined if not found
   */
  getChannel(channelId: string): StateChannel | undefined {
    return this.channels.get(channelId);
  }

  /**
   * Generate a unique identifier for a state channel based on the participating accounts.
   * @param initiator The initiating party's account
   * @param counterparty The counterparty's account
   * @returns The channel ID
   */
  private generateChannelId(initiator: Account, counterparty: Account): string {
    const sortedAccounts = [initiator, counterparty].sort((a, b) => a.address.localeCompare(b.address));
    return `${sortedAccounts[0].address}-${sortedAccounts[1].address}`;
  }
}
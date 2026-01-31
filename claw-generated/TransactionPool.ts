import { Chain } from './Chain';
import { StateManager, AccountState } from './StateManager';
import { sign, verify } from './Crypto';
import { StateChannel, ChannelState } from './StateChannel';

export enum TransactionType {
  REGULAR = 'regular',
  OPEN_CHANNEL = 'open_channel',
  UPDATE_CHANNEL = 'update_channel',
  CLOSE_CHANNEL = 'close_channel'
}

export interface Transaction {
  type: TransactionType;
  data: any;
}

export interface RegularTransaction extends Transaction {
  type: TransactionType.REGULAR;
  from: string;
  to: string;
  amount: number;
  nonce: number;
  signature: string;
}

export interface OpenChannelTransaction extends Transaction {
  type: TransactionType.OPEN_CHANNEL;
  channelState: ChannelState;
  signature1: string;
  signature2: string;
}

export interface UpdateChannelTransaction extends Transaction {
  type: TransactionType.UPDATE_CHANNEL;
  channelId: string;
  channelState: ChannelState;
  signature1: string;
  signature2: string;
}

export interface CloseChannelTransaction extends Transaction {
  type: TransactionType.CLOSE_CHANNEL;
  channelId: string;
  channelState: ChannelState;
  signature1: string;
  signature2: string;
}

export class TransactionPool {
  private chain: Chain;
  private stateManager: StateManager;
  private stateChannel: StateChannel;

  constructor(chain: Chain, stateManager: StateManager, stateChannel: StateChannel) {
    this.chain = chain;
    this.stateManager = stateManager;
    this.stateChannel = stateChannel;
  }

  async addTransaction(tx: Transaction): Promise<void> {
    switch (tx.type) {
      case TransactionType.REGULAR:
        await this.addRegularTransaction(tx as RegularTransaction);
        break;
      case TransactionType.OPEN_CHANNEL:
        await this.addOpenChannelTransaction(tx as OpenChannelTransaction);
        break;
      case TransactionType.UPDATE_CHANNEL:
        await this.addUpdateChannelTransaction(tx as UpdateChannelTransaction);
        break;
      case TransactionType.CLOSE_CHANNEL:
        await this.addCloseChannelTransaction(tx as CloseChannelTransaction);
        break;
      default:
        throw new Error(`Invalid transaction type: ${tx.type}`);
    }
  }

  private async addRegularTransaction(tx: RegularTransaction): Promise<void> {
    // Validate and add regular transaction to the pool
    // ...
  }

  private async addOpenChannelTransaction(tx: OpenChannelTransaction): Promise<void> {
    // Validate and add open channel transaction to the pool
    // ...
  }

  private async addUpdateChannelTransaction(tx: UpdateChannelTransaction): Promise<void> {
    // Validate and add update channel transaction to the pool
    // ...
  }

  private async addCloseChannelTransaction(tx: CloseChannelTransaction): Promise<void> {
    // Validate and add close channel transaction to the pool
    // ...
  }
}
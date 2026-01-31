import { BigNumber } from 'ethers';

interface ChannelState {
  channelId: string;
  participant1: string;
  participant2: string;
  balance1: BigNumber;
  balance2: BigNumber;
  sequenceNumber: number;
}

class StateChannel {
  private state: ChannelState;

  constructor(
    channelId: string,
    participant1: string,
    participant2: string,
    initialBalance1: BigNumber,
    initialBalance2: BigNumber
  ) {
    this.state = {
      channelId,
      participant1,
      participant2,
      balance1: initialBalance1,
      balance2: initialBalance2,
      sequenceNumber: 0,
    };
  }

  updateState(
    newBalance1: BigNumber,
    newBalance2: BigNumber,
    newSequenceNumber: number
  ): ChannelState {
    this.state = {
      ...this.state,
      balance1: newBalance1,
      balance2: newBalance2,
      sequenceNumber: newSequenceNumber,
    };
    return this.state;
  }

  getState(): ChannelState {
    return this.state;
  }
}

export { StateChannel, ChannelState };